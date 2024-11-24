# AI Chat Bot with Blockchain Integration

A sophisticated AI chat interface built with Next.js, featuring blockchain wallet integration, real-time content generation, and image handling capabilities. This project combines the power of AI with blockchain technology to provide a secure, intelligent chat experience.

## 🚨 AI Disclaimer

This project uses AI models and may generate content. Please note:

- Content is AI-generated and may not always be accurate
- The AI has access to read-only wallet data but cannot perform transactions
- Responses are generated in real-time and may vary
- Not financial advice - verify all blockchain-related information
- Models may have biases or limitations
- AI responses are streamed for real-time interaction

## 🌟 Features

### AI Chat Interface

- Real-time streaming responses with progress indicators
- Context-aware conversations with memory
- Document creation and editing in blocks interface
- Code generation and explanation with syntax highlighting
- Multi-modal content generation (text, code, images)
- Smart suggestions and auto-completions

### Blockchain Integration

- Read-only wallet data access for security
- Real-time balance checking across multiple chains
- Detailed transaction history viewing
- NFT collection browsing and metadata display
- Gas estimation and network status
- Support for multiple wallet providers

### Image Handling

- Intelligent avatar support with automatic sizing
- Robust fallback image system
- Optimized loading with lazy load
- Multiple source support (Vercel, GitHub, custom domains)
- Automatic image optimization
- Responsive image handling

### Developer Experience

- TypeScript for type safety
- Comprehensive test coverage with Vitest
- Real-time development with Fast Refresh
- Modular component architecture
- Custom hooks for reusability
- Detailed documentation and examples

## 🛠 Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Geist UI
- shadcn/ui components

### Backend

- Supabase
- Edge Functions
- Serverless Functions
- Real-time subscriptions

### AI & Blockchain

- Vercel AI SDK
- Multiple AI model support
- Blockchain API integration
- Wallet connection handlers

### Testing & Quality

- Vitest
- React Testing Library
- TypeScript strict mode
- ESLint & Prettier

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-chatbot.git
cd ai-chatbot
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Base Network Configuration
NEXT_PUBLIC_BASE_MAINNET_RPC=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
```

5. Start the development server:

```bash
pnpm dev
```

## 🧪 Testing

Run the test suite:

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 📚 Documentation

- [Component Documentation](./docs/COMPONENTS.md)
- [API Documentation](./docs/API.md)
- [Testing Guide](./docs/TESTING.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🔒 Security

- All wallet interactions are read-only
- No private keys are stored or transmitted
- Data is encrypted at rest
- Regular security audits
- Comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for hosting and deployment
- [Supabase](https://supabase.com) for database and authentication
- [OpenAI](https://openai.com) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [Rainbow Kit](https://www.rainbowkit.com/) for wallet integration

## 🔄 Updates & Roadmap

### Latest Updates

- Added multi-modal content support
- Improved real-time streaming performance
- Enhanced wallet integration features
- Added comprehensive test coverage
- Implemented new UI components

### Upcoming Features

- [ ] Enhanced NFT support
- [ ] Additional AI model integrations
- [ ] Improved code generation
- [ ] Advanced document editing
- [ ] Extended blockchain support

## 💬 Support

For support, please:
1. Check the [Documentation](./docs)
2. Search [Issues](https://github.com/yourusername/ai-chatbot/issues)
3. Open a new issue if needed

---

Built with ❤️ using Next.js, Supabase, and OpenAI