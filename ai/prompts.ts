type PromptSection = {
  title: string;
  description: string;
  tools: Array<{
    name: string;
    usage: string[];
    avoid?: string[];
  }>;
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

export const blocksPrompt = formatSection(blocksSection);
export const walletPrompt = formatSection(walletSection);
export const regularPrompt = 'You are a friendly assistant! Keep your responses concise and helpful.';

export const systemPrompt = `${regularPrompt}\n\n${blocksPrompt}\n\n${walletPrompt}`;
