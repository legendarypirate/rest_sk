/// Resolves a node's parent, or null once the root is reached. Undefined means
/// the row is gone, which callers treat the same as a root.
export type ParentResolver = (id: string) => Promise<string | null | undefined>;

/// Guards against reparenting a node under one of its own descendants.
///
/// A database CHECK can only see one row, so it stops `parent_id = id` and
/// nothing deeper: A becomes a child of B, then B a child of A, and the table
/// holds a ring that every recursive read walks forever. This walks up from the
/// candidate parent instead — if the node turns up along that chain, the move
/// would close a loop.
///
/// `maxDepth` bounds the walk. Reaching it means the chain is either absurdly
/// deep or already corrupt, and in both cases the honest answer is to refuse the
/// write rather than loop while holding a transaction open.
export async function wouldCreateCycle(
  nodeId: string,
  candidateParentId: string,
  resolveParent: ParentResolver,
  maxDepth = 64,
): Promise<boolean> {
  if (nodeId === candidateParentId) {
    return true;
  }

  let cursor: string | null | undefined = candidateParentId;

  for (let depth = 0; depth < maxDepth; depth += 1) {
    if (!cursor) {
      return false;
    }

    if (cursor === nodeId) {
      return true;
    }

    cursor = await resolveParent(cursor);
  }

  return true;
}

export type NeighborResolver = (id: string) => Promise<readonly string[]>;

/// Guards against a cycle on a DAG, where a node can have many outgoing edges.
///
/// The parent-walk helper above is enough for a tree. Concept prerequisites are
/// not a tree: "Newton's second law" can require both Force and Acceleration, so
/// a single parent pointer would miss a loop that arrives through the other
/// branch. This walks every neighbour, and treats a visit budget the same way
/// `wouldCreateCycle` treats depth — refuse rather than loop inside a transaction.
export async function wouldCreateGraphCycle(
  nodeId: string,
  neighborIds: readonly string[],
  resolveNeighbors: NeighborResolver,
  maxNodes = 256,
): Promise<boolean> {
  const queue = [...neighborIds];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || seen.has(current)) {
      continue;
    }

    if (current === nodeId) {
      return true;
    }

    if (seen.size >= maxNodes) {
      return true;
    }

    seen.add(current);
    queue.push(...(await resolveNeighbors(current)));
  }

  return false;
}
