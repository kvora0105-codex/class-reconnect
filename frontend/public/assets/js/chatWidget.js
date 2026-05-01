// Floating Chat Widget for dashboard

const widget = document.getElementById('assistant-widget');
const toggleBtn = document.getElementById('assistant-toggle');
const panel = document.getElementById('assistant-panel');
const closeBtn = document.getElementById('assistant-close');
const chat = document.getElementById('assistant-chat');
const form = document.getElementById('assistant-form');
const input = document.getElementById('assistant-input');
const suggested = document.querySelectorAll('.assistant-suggest');

function normalizeQuestion(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const predefinedQA = {
  [normalizeQuestion('What are the ACID properties in databases')]:
    'ACID ensures reliable transactions in relational databases:\n\n' +
    'Atomicity: a transaction executes entirely or not at all. If any part fails, the database rolls back to the state before the transaction. Example: transferring money from account A to B should debit A and credit B together, not just one side.\n\n' +
    'Consistency: every committed transaction leaves the database in a valid state that adheres to all constraints, triggers, and invariants. Violations (e.g., negative balances where forbidden) are prevented.\n\n' +
    'Isolation: concurrent transactions behave as if executed serially. Isolation levels (read committed, repeatable read, serializable) balance concurrency with the risk of anomalies like dirty reads or phantom reads.\n\n' +
    'Durability: once a transaction commits, its effects persist even after crashes. Engines use write-ahead logs, fsyncs, and often replication to guarantee persistence.',
  [normalizeQuestion('Explain object-oriented programming principles')]:
    'Core OOP principles:\n\n' +
    'Encapsulation: keep data and methods together and control access via class interfaces (private/protected/public). This reduces coupling and protects invariants.\n\n' +
    'Abstraction: model complex systems with simplified interfaces, hiding implementation details. Focus on “what” not “how”, enabling easier reasoning and substitution.\n\n' +
    'Inheritance: create specialized types from existing ones (is-a relationship) to reuse behavior. Use carefully to avoid tight coupling (fragile base class); prefer composition when inheritance does not reflect a strict is-a.\n\n' +
    'Polymorphism: same interface, different implementations (method overriding/virtual dispatch). Enables writing code against abstractions and swapping implementations without changing callers.',
  [normalizeQuestion('What is the difference between stack and queue?')]:
    'Stack vs Queue:\n\n' +
    'Stack: Last-In-First-Out (LIFO). Operations: push (add), pop (remove), peek (top). Typical uses include call stacks, backtracking, and undo/redo. Array or linked-list implementations provide O(1) push/pop.\n\n' +
    'Queue: First-In-First-Out (FIFO). Operations: enqueue (rear), dequeue (front), front/peek. Used for task scheduling, breadth-first search, buffering. Array-circular buffer or linked-list implementations provide O(1) enqueue/dequeue.',
  [normalizeQuestion('What is the difference between SQL and NoSQL?')]:
    'SQL vs NoSQL:\n\n' +
    'SQL (relational): structured schemas, strong consistency with ACID transactions, powerful joins and constraints. Great for complex queries and relationships. Typical systems: PostgreSQL, MySQL, SQL Server. Scaling often vertical or via sharding/replication.\n\n' +
    'NoSQL (non-relational): flexible schemas (document, key-value, wide-column, graph), designed for horizontal scaling and high throughput. Consistency may be eventual to maximize availability/partition tolerance. Typical systems: MongoDB (document), Cassandra (wide-column), Redis (key-value), Neo4j (graph).\n\n' +
    'Choose based on data model, query patterns, consistency needs, and scaling requirements.',
  [normalizeQuestion('Explain the concept of Big O notation')]:
    'Big O notation describes the upper bound of time/space growth with input size n, focusing on asymptotic behavior and ignoring constant factors.\n\n' +
    'Common classes: O(1) constant, O(log n) logarithmic (binary search), O(n) linear (single pass), O(n log n) (efficient sorts like merge/quick on average), O(n^2) quadratic (nested loops), O(2^n)/O(n!) exponential/factorial (brute force on combinatorial problems).\n\n' +
    'It helps compare scalability. Example: for n=1,000,000, O(n log n) sorting is far faster than O(n^2). Always consider average vs worst case and memory usage alongside runtime.',
  [normalizeQuestion('How does a binary search tree work?')]:
    'Binary Search Tree (BST): for every node, values in the left subtree are less and values in the right subtree are greater than the node.\n\n' +
    'Operations: search, insert, delete typically follow comparisons down the tree, average O(log n) in balanced trees but O(n) in the worst case when the tree degenerates.\n\n' +
    'Balancing: self-balancing variants (AVL, Red-Black) maintain height ~O(log n) to guarantee performance. Traversals: in-order yields sorted order; pre-order/post-order useful for serialization and subtree processing.'
  ,
  [normalizeQuestion('Explain merge sort with complexity')]:
    'Merge sort is a divide-and-conquer algorithm: split the array, sort halves recursively, then merge.\n\n' +
    'Time complexity: O(n log n) across best/average/worst. Space complexity: O(n) due to auxiliary arrays.\n\n' +
    'Stable: yes. Good for linked lists and data where stable sorting matters; less optimal for in-place constraints.',
  [normalizeQuestion('Explain quick sort with complexity')]:
    'Quicksort partitions the array around a pivot, then recursively sorts subarrays.\n\n' +
    'Average/Best time: O(n log n). Worst case: O(n^2) if poor pivots (e.g., already sorted with naive pivot). Space: O(log n) average stack due to recursion.\n\n' +
    'Typically fastest in practice with good pivot selection (median-of-three, randomized). Not stable by default.',
  [normalizeQuestion('BFS vs DFS differences and use cases')]:
    'BFS explores level by level using a queue; DFS goes deep first using a stack/recursion.\n\n' +
    'BFS use cases: shortest path in unweighted graphs, level-order traversal. DFS use cases: cycle detection, topological sort, path existence, connected components.\n\n' +
    'Complexity: O(V+E) for both on adjacency structures.',
  [normalizeQuestion('What are database indexes and their types?')]:
    'Indexes accelerate lookups by maintaining ordered structures.\n\n' +
    'Types: B-Tree (default for range queries), Hash (exact match), Bitmap (low-cardinality), Full-text (text search), GiST/SP-GiST (custom structures in PostgreSQL).\n\n' +
    'Trade-offs: faster reads, slower writes; extra storage; careful selection based on query patterns.',
  [normalizeQuestion('Explain normalization and normal forms')]:
    'Normalization reduces redundancy and anomalies.\n\n' +
    '1NF: atomic values, no repeating groups. 2NF: no partial dependency on a composite key. 3NF: no transitive dependencies; non-key attributes depend only on the key. BCNF: stronger form where every determinant is a candidate key.',
  [normalizeQuestion('REST vs GraphQL differences')]:
    'REST exposes multiple endpoints with fixed shapes; GraphQL exposes a single endpoint with a typed schema allowing clients to query exactly what they need.\n\n' +
    'REST pros: caching simplicity, mature tooling, simplicity. GraphQL pros: reduced over/under-fetching, strong typing, introspection.\n\n' +
    'Trade-offs: GraphQL requires schema and resolvers; caching is more involved; REST can be simpler for basic CRUD.',
  [normalizeQuestion('Explain the CAP theorem')]:
    'CAP: in a distributed system under partition, you must choose between Consistency and Availability.\n\n' +
    'Consistency: all nodes see the same data at the same time. Availability: every request receives a response (success/failure). Partition tolerance: system continues despite network splits.\n\n' +
    'Systems pick trade-offs (CP vs AP) based on business needs.',
  [normalizeQuestion('Deadlock conditions and prevention')]:
    'Deadlock occurs when processes wait on each other indefinitely.\n\n' +
    'Necessary conditions: mutual exclusion, hold and wait, no preemption, circular wait.\n\n' +
    'Prevention: break one condition (e.g., impose resource ordering to avoid circular wait), or use detection and recovery.',
  [normalizeQuestion('Stack vs heap memory in C')]:
    'Stack: automatic storage, LIFO allocation, fast, size-limited; variables die when scope ends.\n\n' +
    'Heap: dynamic allocation via malloc/free, flexible size, slower, fragmentation risk; must manage lifetime explicitly to avoid leaks/dangling pointers.',
  [normalizeQuestion('Explain SQL joins')]:
    'Inner join: matching rows only. Left/Right join: include all rows from one side and matching from the other, filling nulls when no match. Full join: include all rows from both sides. Cross join: Cartesian product.\n\n' +
    'Use join conditions wisely (ON vs WHERE) to avoid accidental cross-products.'
};

function getPredefinedAnswer(question) {
  const key = normalizeQuestion(question);
  if (predefinedQA[key]) return predefinedQA[key];
  if (dynamicQABriefs && dynamicQABriefs.has(key)) {
    const cached = dynamicQABriefs.get(key);
    if (cached) return cached;
  }
  const related = generateBriefAnswer(question);
  if (related) return related;
  return null;
}

let dynamicQuestionsSet = null;
let dynamicQABriefs = null;
async function loadPredefinedQuestions() {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/predefined/questions', {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.questions)) {
      dynamicQuestionsSet = new Set(data.questions.map(normalizeQuestion));
      dynamicQABriefs = new Map();
      for (const q of data.questions) {
        const norm = normalizeQuestion(q);
        dynamicQABriefs.set(norm, generateBriefAnswer(q));
      }
    }
  } catch (_) {}
}

function generateBriefAnswer(q) {
  const s = normalizeQuestion(q);
  function has(...terms){ return terms.every(t => s.includes(normalizeQuestion(t))); }
  function any(...terms){ return terms.some(t => s.includes(normalizeQuestion(t))); }

  if (any('what is stack','what is queue') && any('abstract data type')) {
    return 'An Abstract Data Type defines behavior and valid operations without fixing implementation. A stack is LIFO with push, pop, and peek operations. Typical implementations use arrays or linked lists and give O(1) operations. A queue is FIFO with enqueue, dequeue, and front operations. These ADTs power undo/redo, call stacks, buffering, scheduling, and BFS.';
  }
  if (any('what is stack overflow') || any('what is underflow')) {
    return 'Stack overflow happens when pushes exceed capacity or recursion grows beyond available stack. Stack underflow happens when popping from an empty stack. Both indicate violating preconditions of operations. Prevent with capacity checks, iterative conversions for deep recursion, and bounded data structures. Also log and handle errors gracefully to avoid crashes.';
  }
  if (has('what is circular queue')) {
    return 'A circular queue uses modulo arithmetic to wrap front and rear and reuse freed slots. It avoids false overflow seen in linear arrays after deletions. Track empty and full states using an item count or a reserved slot scheme. Enqueue and dequeue run in O(1) time in fixed-size buffers. It is ideal for producer–consumer buffering and device I/O queues.';
  }
  if (any('what is priority queue')) {
    return 'A priority queue serves elements by priority rather than arrival order. Binary heaps provide O(log n) insert and extract-min/max operations. Alternatives include pairing heaps, binomial heaps, and balanced trees. Choose structure based on decrease-key and meld requirements. Use in Dijkstra’s algorithm, task schedulers, job queues, and simulations.';
  }
  if (any('what is linked list') && any('singly')) {
    return 'A singly linked list consists of nodes holding data and a next pointer. Insert/delete at the head are O(1); tail operations are O(n) unless a tail pointer is maintained. Searching is O(n) due to sequential traversal. It grows flexibly without reallocation. Trade-offs include extra pointer memory and lack of random access.';
  }
  if (any('what is linked list') && any('doubly')) {
    return 'A doubly linked list adds a prev pointer enabling bidirectional traversal. Deletion and splicing are O(1) with a node reference. Memory overhead increases and pointer updates must be carefully maintained. It is well suited for deques and LRU caches. Sentinel nodes simplify edge handling at ends.';
  }
  if (any('what is recursion') && any('stack')) {
    return 'Recursion breaks a problem into smaller subproblems and relies on the call stack to track frames. Always define clear base cases and make progress toward them. Deep recursion risks stack overflow and may need iterative conversion. Tail calls can be optimized in some languages but not all. An explicit stack often turns recursion into safe iteration.';
  }
  if (any('what is binary search tree')) {
    return 'A Binary Search Tree stores keys so left < node < right recursively. Average search, insert, and delete are O(log n) when height is small. Worst case degrades to O(n) if the tree becomes skewed. In-order traversal returns keys in sorted order. Use AVL or Red–Black trees to maintain balance reliably.';
  }
  if (any('what is avl tree')) {
    return 'An AVL tree is a self-balancing BST that enforces |balance factor| ≤ 1. It performs rotations (LL, RR, LR, RL) after inserts/deletes to restore height. Operations remain O(log n) with strong worst-case guarantees. Rebalancing overhead is small but consistent. Use it where predictable performance is required.';
  }
  if (any('what is expression tree')) {
    return 'An expression tree models arithmetic with operator nodes and operand leaves. Build from postfix by using a stack to assemble nodes. Infix requires precedence handling via shunting-yard before construction. Evaluate recursively by computing child values and applying the operator. Trees enable optimization and easy serialization.';
  }
  if (any('what are types of tree traversal') && (any('what is inorder traversal') || any('what is preorder traversal') || any('what is post order traversal'))) {
    return 'Inorder visits left, node, right and produces sorted order in BSTs. Preorder visits node first and is useful for serialization and cloning. Postorder visits children before node and supports deletions and bottom-up evaluation. Each traversal has iterative variants using stacks. Choose based on the downstream task and output order required.';
  }
  if (any('what is huffman coding')) {
    return 'Huffman coding constructs optimal prefix-free codes from symbol frequencies. It repeatedly merges the two least frequent items using a min-heap. The algorithm runs in O(n log n) time for n symbols. Decoding is deterministic by walking the tree per bit. It is a cornerstone of practical lossless compression.';
  }
  if (any('what is b tree')) {
    return 'A B-Tree is a balanced multiway search tree optimized for disks. Nodes hold multiple keys and children, keeping height shallow. Search, insert, and delete are O(log n) in the number of keys. Splits and merges maintain invariants under updates. It is widely used for database and filesystem indexes.';
  }
  if (any('what is graph traversal')) {
    return 'Graph traversal systematically explores vertices and edges. BFS uses a queue, visits levels, and finds shortest paths in unweighted graphs. DFS uses a stack or recursion to explore deeply and discover components and cycles. Both run in O(V+E) on adjacency structures. Choose based on path requirements and exploration pattern.';
  }
  if (any('what is graph representation')) {
    return 'Adjacency lists store neighbors per vertex with space O(V+E). Adjacency matrices use O(V^2) space and give O(1) edge checks. Lists favor sparse graphs and fast iteration over neighbors. Matrices favor dense graphs and algorithms needing quick adjacency tests. Pick based on density and operation costs.';
  }
  if (any('what is hashing') && any('what is linear probing')) {
    return 'Linear probing handles collisions by scanning consecutive slots from a hash position. It is simple and cache-friendly due to contiguous memory. Primary clustering can degrade performance as runs grow. Deletion needs tombstones to preserve probe chains. Keep load factor around 0.7 or lower to maintain speed.';
  }
  if (any('what is quadratic probing')) {
    return 'Quadratic probing tries offsets that grow quadratically from the initial slot. It reduces primary clustering compared to linear probing. Proper table sizes and load factors are crucial to ensure reachability and performance. Secondary clustering can still occur for equal hash values. Double hashing further improves distribution when needed.';
  }
  if (any('what is linear search')) {
    return 'Linear search scans items sequentially until a match is found. It runs in O(n) time and O(1) space. It works on unsorted data and is trivial to implement. It is inefficient for large datasets compared to indexed or sorted structures. Prefer hashing or binary search when applicable.';
  }
  if (any('what is binary search')) {
    return 'Binary search halves the search space on sorted data by comparing the midpoint. It runs in O(log n) time with O(1) space. Guard against integer overflow when computing mid. Works best on random-access arrays or balanced trees. It fails on unsorted data or cyclic structures.';
  }
  if (any('what is collision resolution') && any('hash')) {
    return 'Hash collisions require strategies to store multiple keys per hash value. Chaining uses linked lists per bucket and handles high load well. Open addressing keeps entries in the table and probes for alternate slots. Each approach trades memory, cache behavior, and sensitivity to load factor. Choose based on performance targets and deletion patterns.';
  }
  if (any('what is dbms') || any('what is database') || any('er diagram') || any('normalization')) {
    return 'A DBMS stores and manages structured data with correctness and performance guarantees. ER modeling captures entities, relationships, and constraints. Normalization (1NF through BCNF) reduces redundancy and update anomalies. Indexes like B+Trees and Hash tables accelerate queries. Transactions with ACID ensure reliable multi-user updates.';
  }
  if (any('what is acid properties') || any('what is transaction isolation')) {
    return 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity makes transactions all-or-nothing. Consistency preserves database constraints after commits. Isolation makes concurrent work behave like serial execution at chosen levels. Durability ensures committed changes survive crashes.';
  }
  if (any('what is deadlock') && any('transaction')) {
    return 'A deadlock is a cycle of transactions waiting on each other for resources. The four conditions include mutual exclusion, hold-and-wait, no preemption, and circular wait. Prevent by ordering resources or avoiding hold-and-wait patterns. Detect using wait-for graphs and cycle checks. Recover by aborting one transaction and releasing its locks.';
  }
  if (any('what is ieee 754') || any('what is floating point')) {
    return 'IEEE 754 encodes numbers using sign, biased exponent, and significand fields. Single precision uses 1-8-23 bits; double uses 1-11-52 bits. Special values include NaN, infinities, and subnormals with defined behaviors. Rounding modes like nearest-even control results. Numerical error accumulates, so guard sensitive computations.';
  }
  if (any('what is booth algorithm')) {
    return 'Booth’s algorithm multiplies signed binaries by recoding bit patterns. It compresses runs of ones into fewer add/subtract operations. Two’s complement representation is handled naturally in the process. Hardware and software implementations benefit on patterned inputs. Worst-case performance matches classic shift-and-add.';
  }
  if (any('what is bcd')) {
    return 'Binary-Coded Decimal stores each decimal digit in its own 4-bit nibble. It simplifies exact decimal arithmetic by avoiding binary rounding artifacts. Adders perform decimal correction (add 6) when a nibble exceeds nine. BCD costs more bits than pure binary representation. Finance and embedded systems use it for precision and simplicity.';
  }
  if (any('what is nand') || any('what is nor')) {
    return 'NAND and NOR are universal logic gates. Any Boolean function can be synthesized using only NAND or only NOR. Basic gates like NOT, AND, and OR are built by small compositions. De Morgan’s laws guide transformations between forms. This property underpins flexible digital circuit design.';
  }
  if (any('what is adder') && (any('full') || any('half'))) {
    return 'A half adder outputs sum and carry for two input bits. A full adder also consumes a carry-in and produces a carry-out. Ripple-carry adders chain full adders but suffer from long carry delays. Carry-lookahead and carry-select adders reduce propagation time. Choose design based on speed, area, and power constraints.';
  }
  if (any('what is multiplexer')) {
    return 'A multiplexer selects one of many inputs based on control signals. It routes the chosen input to a single output line. MUXes implement conditional data paths and logic functions. Larger MUXes are composed from smaller ones hierarchically. They are pervasive in CPUs, FPGAs, and digital systems.';
  }
  if (any('what is memory hierarchy') || any('what is cache')) {
    return 'Memory hierarchy exploits temporal and spatial locality to bridge CPU speed gaps. Levels include registers, multiple cache tiers, DRAM, and persistent storage. Write-through and write-back control when data reaches lower levels. Coherence protocols like MESI synchronize caches across cores. Performance hinges on hit rates and latency balance.';
  }
  if (any('what is pipeline') || any('what is hazard')) {
    return 'Pipelining overlaps instruction stages to raise throughput. Data hazards are mitigated with forwarding and stalls. Control hazards are addressed with accurate branch prediction. Structural hazards are fixed by resource duplication or scheduling. Overall speed depends on minimizing bubbles in the pipeline.';
  }
  if (any('what is control unit') || any('what is microprogrammed') || any('what is hardwired')) {
    return 'The control unit orchestrates instruction execution by generating control signals. Hardwired control encodes logic directly for speed. Microprogrammed control uses stored microinstructions for flexibility. The trade-off is speed versus extensibility and design effort. Complex ISAs often benefit from microprogramming.';
  }
  if (any('what is laplace transform') || s.includes(' l (')) {
    return 'The Laplace transform maps time-domain functions to an s-domain for easier algebra. Linearity, shifts, and differentiation map to simple algebraic forms. Solve ODEs by transforming, manipulating, and inverting via tables or partial fractions. Poles determine stability and transient behavior. It is a standard tool in control and circuit analysis.';
  }
  if (any('what is orthogonal trajectory')) {
    return 'Orthogonal trajectories intersect a given curve family at right angles. Find dy/dx for the family and take the negative reciprocal for orthogonal slopes. Substitute and solve the differential equation to obtain the new family. Integrate and include constants properly. Express solutions in the original variables.';
  }
  if (any('what is analytic function')) {
    return 'A complex function is analytic if it is differentiable in a neighborhood. The Cauchy–Riemann equations with continuous partials are required. Analytic functions are infinitely differentiable and equal their Taylor series locally. Build f(z) by finding a harmonic conjugate to u or v. Many integral theorems follow, including Cauchy’s integral formula.';
  }
  return 'Summarize the concept, list core operations or properties, give typical complexities, note trade-offs or implementations, and end with a practical use case.';
}

if (widget && toggleBtn && panel && closeBtn && chat && form && input) {
  // Toggle open/close
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      input.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  // Helpers
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
  }

  function addUserMessage(message) {
    const row = document.createElement('div');
    row.className = 'flex items-start gap-2 justify-end';
    row.innerHTML = `
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none shadow p-3 max-w-[85%]">
        <p class="leading-relaxed text-sm">${escapeHtml(message)}</p>
      </div>
      <div class="flex-shrink-0 bg-slate-300 p-1 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
    `;
    chat.appendChild(row);
    scrollToBottom();
  }

  function addAIMessage(message) {
    const row = document.createElement('div');
    row.className = 'flex items-start gap-2';
    row.innerHTML = `
      <div class="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 p-1 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z"></path></svg>
      </div>
      <div class="bg-white rounded-2xl rounded-tl-none shadow p-3 max-w-[85%]">
        <p class="text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">${escapeHtml(message)}</p>
        <span class="text-xs text-slate-500 mt-1 block">AI Assistant</span>
      </div>
    `;
    chat.appendChild(row);
    scrollToBottom();
  }

  function addTyping() {
    const row = document.createElement('div');
    row.id = 'assistant-typing';
    row.className = 'flex items-start gap-2';
    row.innerHTML = `
      <div class="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 p-1 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z"></path></svg>
      </div>
      <div class="bg-white rounded-2xl rounded-tl-none shadow p-3 max-w-[85%]">
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
          <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0.2s"></span>
          <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0.4s"></span>
        </div>
      </div>
    `;
    chat.appendChild(row);
    scrollToBottom();
  }

  function removeTyping() {
    const row = document.getElementById('assistant-typing');
    if (row) row.remove();
  }

  // Submit handler
  async function handleQuestion(q) {
    addUserMessage(q);
    input.value = '';
    input.disabled = true;
    addTyping();

    await new Promise(r => setTimeout(r, 300));
    removeTyping();

    const answer = getPredefinedAnswer(q);
    if (answer) {
      addAIMessage(answer);
    } else {
      addAIMessage('I currently answer only predefined questions. Try a suggested one.');
    }

    input.disabled = false;
    input.focus();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    await handleQuestion(q);
  });

  // Suggested prompts
  suggested.forEach(btn => {
    btn.addEventListener('click', async () => {
      const q = btn.textContent.trim();
      await handleQuestion(q);
    });
  });
  loadPredefinedQuestions();
}