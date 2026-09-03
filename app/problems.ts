export type Difficulty = '简单' | '中等' | '困难';

export type Problem = {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
};

const p = (
  category: string,
  difficulty: Difficulty,
  rows: Array<[number, string, string]>,
): Problem[] => rows.map(([id, title, slug]) => ({ id, title, slug, difficulty, category }));

export const problems: Problem[] = [
  ...p('哈希', '简单', [[1, '两数之和', 'two-sum']]),
  ...p('哈希', '中等', [[49, '字母异位词分组', 'group-anagrams'], [128, '最长连续序列', 'longest-consecutive-sequence']]),
  ...p('双指针', '简单', [[283, '移动零', 'move-zeroes']]),
  ...p('双指针', '中等', [[11, '盛最多水的容器', 'container-with-most-water'], [15, '三数之和', '3sum']]),
  ...p('双指针', '困难', [[42, '接雨水', 'trapping-rain-water']]),
  ...p('滑动窗口', '中等', [[3, '无重复字符的最长子串', 'longest-substring-without-repeating-characters'], [438, '找到字符串中所有字母异位词', 'find-all-anagrams-in-a-string']]),
  ...p('子串', '中等', [[560, '和为 K 的子数组', 'subarray-sum-equals-k']]),
  ...p('子串', '困难', [[239, '滑动窗口最大值', 'sliding-window-maximum'], [76, '最小覆盖子串', 'minimum-window-substring']]),
  ...p('普通数组', '中等', [[53, '最大子数组和', 'maximum-subarray'], [56, '合并区间', 'merge-intervals'], [189, '轮转数组', 'rotate-array'], [238, '除自身以外数组的乘积', 'product-of-array-except-self']]),
  ...p('普通数组', '困难', [[41, '缺失的第一个正数', 'first-missing-positive']]),
  ...p('矩阵', '中等', [[73, '矩阵置零', 'set-matrix-zeroes'], [54, '螺旋矩阵', 'spiral-matrix'], [48, '旋转图像', 'rotate-image'], [240, '搜索二维矩阵 II', 'search-a-2d-matrix-ii']]),
  ...p('链表', '简单', [[160, '相交链表', 'intersection-of-two-linked-lists'], [206, '反转链表', 'reverse-linked-list'], [234, '回文链表', 'palindrome-linked-list'], [141, '环形链表', 'linked-list-cycle'], [21, '合并两个有序链表', 'merge-two-sorted-lists']]),
  ...p('链表', '中等', [[142, '环形链表 II', 'linked-list-cycle-ii'], [2, '两数相加', 'add-two-numbers'], [19, '删除链表的倒数第 N 个结点', 'remove-nth-node-from-end-of-list'], [24, '两两交换链表中的节点', 'swap-nodes-in-pairs'], [138, '随机链表的复制', 'copy-list-with-random-pointer'], [148, '排序链表', 'sort-list'], [146, 'LRU 缓存', 'lru-cache']]),
  ...p('链表', '困难', [[25, 'K 个一组翻转链表', 'reverse-nodes-in-k-group'], [23, '合并 K 个升序链表', 'merge-k-sorted-lists']]),
  ...p('二叉树', '简单', [[94, '二叉树的中序遍历', 'binary-tree-inorder-traversal'], [104, '二叉树的最大深度', 'maximum-depth-of-binary-tree'], [226, '翻转二叉树', 'invert-binary-tree'], [101, '对称二叉树', 'symmetric-tree'], [543, '二叉树的直径', 'diameter-of-binary-tree'], [108, '将有序数组转换为二叉搜索树', 'convert-sorted-array-to-binary-search-tree']]),
  ...p('二叉树', '中等', [[102, '二叉树的层序遍历', 'binary-tree-level-order-traversal'], [98, '验证二叉搜索树', 'validate-binary-search-tree'], [230, '二叉搜索树中第 K 小的元素', 'kth-smallest-element-in-a-bst'], [199, '二叉树的右视图', 'binary-tree-right-side-view'], [114, '二叉树展开为链表', 'flatten-binary-tree-to-linked-list'], [105, '从前序与中序遍历序列构造二叉树', 'construct-binary-tree-from-preorder-and-inorder-traversal'], [437, '路径总和 III', 'path-sum-iii'], [236, '二叉树的最近公共祖先', 'lowest-common-ancestor-of-a-binary-tree']]),
  ...p('二叉树', '困难', [[124, '二叉树中的最大路径和', 'binary-tree-maximum-path-sum']]),
  ...p('图论', '中等', [[200, '岛屿数量', 'number-of-islands'], [994, '腐烂的橘子', 'rotting-oranges'], [207, '课程表', 'course-schedule'], [208, '实现 Trie（前缀树）', 'implement-trie-prefix-tree']]),
  ...p('回溯', '中等', [[46, '全排列', 'permutations'], [78, '子集', 'subsets'], [17, '电话号码的字母组合', 'letter-combinations-of-a-phone-number'], [39, '组合总和', 'combination-sum'], [22, '括号生成', 'generate-parentheses'], [79, '单词搜索', 'word-search'], [131, '分割回文串', 'palindrome-partitioning']]),
  ...p('回溯', '困难', [[51, 'N 皇后', 'n-queens']]),
  ...p('二分查找', '简单', [[35, '搜索插入位置', 'search-insert-position']]),
  ...p('二分查找', '中等', [[74, '搜索二维矩阵', 'search-a-2d-matrix'], [34, '在排序数组中查找元素的第一个和最后一个位置', 'find-first-and-last-position-of-element-in-sorted-array'], [33, '搜索旋转排序数组', 'search-in-rotated-sorted-array'], [153, '寻找旋转排序数组中的最小值', 'find-minimum-in-rotated-sorted-array']]),
  ...p('二分查找', '困难', [[4, '寻找两个正序数组的中位数', 'median-of-two-sorted-arrays']]),
  ...p('栈', '简单', [[20, '有效的括号', 'valid-parentheses']]),
  ...p('栈', '中等', [[155, '最小栈', 'min-stack'], [394, '字符串解码', 'decode-string'], [739, '每日温度', 'daily-temperatures']]),
  ...p('栈', '困难', [[84, '柱状图中最大的矩形', 'largest-rectangle-in-histogram']]),
  ...p('堆', '中等', [[215, '数组中的第 K 个最大元素', 'kth-largest-element-in-an-array'], [347, '前 K 个高频元素', 'top-k-frequent-elements']]),
  ...p('堆', '困难', [[295, '数据流的中位数', 'find-median-from-data-stream']]),
  ...p('贪心算法', '简单', [[121, '买卖股票的最佳时机', 'best-time-to-buy-and-sell-stock']]),
  ...p('贪心算法', '中等', [[55, '跳跃游戏', 'jump-game'], [45, '跳跃游戏 II', 'jump-game-ii'], [763, '划分字母区间', 'partition-labels']]),
  ...p('动态规划', '简单', [[70, '爬楼梯', 'climbing-stairs'], [118, '杨辉三角', 'pascals-triangle']]),
  ...p('动态规划', '中等', [[198, '打家劫舍', 'house-robber'], [279, '完全平方数', 'perfect-squares'], [322, '零钱兑换', 'coin-change'], [139, '单词拆分', 'word-break'], [300, '最长递增子序列', 'longest-increasing-subsequence'], [152, '乘积最大子数组', 'maximum-product-subarray'], [416, '分割等和子集', 'partition-equal-subset-sum']]),
  ...p('动态规划', '困难', [[32, '最长有效括号', 'longest-valid-parentheses']]),
  ...p('多维动态规划', '中等', [[62, '不同路径', 'unique-paths'], [64, '最小路径和', 'minimum-path-sum'], [5, '最长回文子串', 'longest-palindromic-substring'], [1143, '最长公共子序列', 'longest-common-subsequence'], [72, '编辑距离', 'edit-distance']]),
  ...p('技巧', '简单', [[136, '只出现一次的数字', 'single-number'], [169, '多数元素', 'majority-element']]),
  ...p('技巧', '中等', [[75, '颜色分类', 'sort-colors'], [31, '下一个排列', 'next-permutation'], [287, '寻找重复数', 'find-the-duplicate-number']]),
];

export const categories = [...new Set(problems.map((problem) => problem.category))];
