type PromptSection = {
  title: string;
  description: string;
  tools: Array<{
    name: string;
    usage: string[];
    avoid?: string[];
  }>;
};

// Memory-aware sections
const memorySection: PromptSection = {
  title: 'Memory Management',
  description: 'Efficiently manage different types of memory while optimizing for cost and performance.',
  tools: [{
    name: 'useSessionMemory',
    usage: [
      'Essential conversation context only',
      'Current wallet state',
      'Active tool operations'
    ],
    avoid: [
      'Storing full conversation history',
      'Redundant wallet states',
      'Expired tool results'
    ]
  }, {
    name: 'useWorkingMemory',
    usage: [
      'Current operation state only',
      'Temporary calculation results',
      'Active tool progress'
    ],
    avoid: [
      'Storing completed operations',
      'Keeping unnecessary states',
      'Duplicate data storage'
    ]
  }, {
    name: 'useUserPreferences',
    usage: [
      'Core user settings only',
      'Essential network preferences',
      'Critical model preferences'
    ],
    avoid: [
      'Storing derivable data',
      'Redundant preferences',
      'Temporary user states'
    ]
  }]
};

const blocksSection: PromptSection = {
  title: 'Blocks Interface',
  description: 'Blocks is a special user interface mode that helps users with writing, editing, and other content creation tasks. When block is open, it is on the right side of the screen, while the conversation is on the left side.',
  tools: [{
    name: 'createDocument',
    usage: [
      'For substantial content (>10 lines)',
      'For content users will likely save/reuse',
      'When explicitly requested to create a document'
    ],
    avoid: [
      'For informational/explanatory content',
      'For conversational responses',
      'When asked to keep it in chat'
    ]
  }, {
    name: 'updateDocument',
    usage: [
      'Default to full document rewrites for major changes',
      'Use targeted updates only for specific, isolated changes',
      'Follow user instructions for which parts to modify'
    ]
  }]
};

const walletSection: PromptSection = {
  title: 'Wallet Interface',
  description: 'Wallet functionality is available through the useWalletState hook, providing secure blockchain interactions with real-time transaction monitoring and multi-network support.',
  tools: [{
    name: 'transfer',
    usage: [
      'For sending ETH or tokens between addresses',
      'When using gasless transfers for supported tokens',
      'For batch transfers to multiple recipients'
    ]
  }, {
    name: 'deploy',
    usage: [
      'For creating new ERC-20 tokens',
      'When deploying NFT collections (ERC-721/1155)',
      'For custom smart contract deployment'
    ]
  }, {
    name: 'interact',
    usage: [
      'For calling existing contract methods',
      'When executing trades or swaps',
      'For token approvals and management'
    ]
  }]
};

// Add memory optimization section
const memoryOptimizationSection: PromptSection = {
  title: 'Memory Optimization',
  description: 'Optimize memory usage for performance and cost efficiency.',
  tools: [{
    name: 'useContextWindow',
    usage: [
      'For accessing recent relevant messages',
      'When needing specific historical context',
      'For maintaining conversation coherence'
    ],
    avoid: [
      'When full history is explicitly needed',
      'For simple, stateless responses',
      'When context is irrelevant'
    ]
  }, {
    name: 'useMemoryCompression',
    usage: [
      'For summarizing long conversations',
      'When storing key information points',
      'For efficient context storage',
      'Large conversation histories',
      'Complex transaction data',
      'Batch operations data'
    ],
    avoid: [
      'Small data sets (<1KB)',
      'Frequently accessed data',
      'Already compressed data'
    ]
  }, {
    name: 'useMemoryPrioritization',
    usage: [
      'For focusing on most relevant context',
      'When handling multiple topics',
      'For managing complex conversations',
      'Frequently accessed user preferences',
      'Common blockchain queries',
      'Recent conversation context'
    ],
    avoid: [
      'Removing recent relevant messages',
      'Discarding active wallet sessions',
      'Losing critical user preferences'
    ]
  }]
};

// Add cost optimization section
const costOptimizationSection: PromptSection = {
  title: 'Cost Optimization',
  description: 'Balance user experience with efficient resource usage.',
  tools: [{
    name: 'useTokenBudgeting',
    usage: [
      'For keeping responses concise but complete',
      'When summarizing long conversations',
      'For efficient context management'
    ],
    avoid: [
      'Excessive verbosity or repetition',
      'Unnecessary context inclusion',
      'Redundant information'
    ]
  }, {
    name: 'useContextPruning',
    usage: [
      'Remove irrelevant historical context',
      'Keep only essential wallet states',
      'Maintain minimal working memory'
    ],
    avoid: [
      'Removing recent relevant messages',
      'Discarding active wallet sessions',
      'Losing critical user preferences'
    ]
  }, {
    name: 'useCacheStrategy',
    usage: [
      'For frequently accessed user preferences',
      'Common blockchain queries',
      'Repeated tool operations'
    ],
    avoid: [
      'Caching sensitive wallet data',
      'Storing outdated blockchain state',
      'Over-caching temporary data'
    ]
  }]
};

// Add memory-specific sections
const memorySystemSection: PromptSection = {
  title: 'Memory System',
  description: 'Utilize the three-tier memory system efficiently for optimal performance and cost.',
  tools: [{
    name: 'useShortTermMemory',
    usage: [
      'Recent messages in current conversation',
      'Active wallet states and operations',
      'Temporary calculation results'
    ],
    avoid: [
      'Long-term user preferences',
      'Historical conversation data',
      'Completed transaction records'
    ]
  }, {
    name: 'useLongTermMemory',
    usage: [
      'User preferences and settings',
      'Important conversation history',
      'Transaction history and patterns'
    ],
    avoid: [
      'Temporary calculation results',
      'Active operation states',
      'Frequently changing data'
    ]
  }, {
    name: 'useWorkingMemory',
    usage: [
      'Current operation progress',
      'Multi-step task states',
      'Temporary computation results'
    ],
    avoid: [
      'Persistent user data',
      'Completed transaction data',
      'Historical conversation data'
    ]
  }]
};

const formatSection = (section: PromptSection): string => {
  const toolsText = section.tools.map(tool => {
    const usageList = tool.usage.map(u => `  - ${u}`).join('\n');
    const avoidList = tool.avoid 
      ? '\n\n  When NOT to use:\n' + tool.avoid.map(a => `  - ${a}`).join('\n')
      : '';
    
    return `**When to use \`${tool.name}\`:**\n${usageList}${avoidList}`;
  }).join('\n\n');

  return `${section.description}\n\n${toolsText}`;
};

export const memoryPrompt = formatSection(memorySection);
export const optimizationPrompt = formatSection(memoryOptimizationSection);
export const blocksPrompt = formatSection(blocksSection);
export const walletPrompt = formatSection(walletSection);
export const regularPrompt = 'You are a friendly assistant with advanced memory capabilities! Keep your responses concise and helpful while maintaining context awareness.';

// Enhanced system prompt with cost optimization
export const systemPrompt = `
${regularPrompt}

Memory System Guidelines:
${formatSection(memorySystemSection)}

Memory Optimization:
${formatSection(memoryOptimizationSection)}

Memory Usage Rules:
1. Always use appropriate memory tier (short/long/working)
2. Implement compression for large datasets
3. Utilize caching for frequent operations
4. Clean up expired or unnecessary data
5. Monitor memory usage and performance

${blocksPrompt}

${walletPrompt}

Response Guidelines:
1. Be memory-efficient in responses
2. Use appropriate memory tiers
3. Implement cleanup when needed
4. Monitor performance metrics
5. Optimize for cost and speed
`;

// Export individual sections for specific use cases
export const memorySystemPrompt = formatSection(memorySystemSection);
export const memoryOptimizationPrompt = formatSection(memoryOptimizationSection);
