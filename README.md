# Chainable Guru - AI Chatbot with Blockchain Integration

A sophisticated AI chat interface built with Next.js 15, featuring blockchain wallet integration, real-time content generation, and advanced document editing capabilities. This project combines the power of AI with modern web technologies to provide a secure, intelligent chat experience.

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
- Version control for documents

### Blockchain Integration

- Read-only wallet data access for security
- Real-time balance checking across multiple chains
- Detailed transaction history viewing
- NFT collection browsing and metadata display
- Gas estimation and network status
- Support for multiple wallet providers

### Advanced Document Editing

- ProseMirror-based rich text editor
- Real-time collaboration features
- Version history and diff viewing
- Markdown support with live preview
- Document suggestions and improvements

### Developer Experience

- TypeScript for type safety
- Next.js 15 with App Router
- Modern React patterns and hooks
- Comprehensive error handling
- Optimized build configuration
- Security best practices

## 🛠 Tech Stack

### Frontend

- **Next.js 15** (App Router)
- **React 18** with Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations

### Backend & Database

- **Supabase** for database and authentication
- **Vercel AI SDK** for AI integration
- **OpenAI API** for language models
- **Vercel Blob** for file storage
- **Vercel KV** for caching

### AI & Blockchain

- **Vercel AI SDK** for streaming responses
- **Multiple AI model support** (GPT-4, Claude, etc.)
- **Blockchain API integration**
- **Wallet connection handlers**

### Development Tools

- **Biome** for linting and formatting
- **ESLint** for code quality
- **TypeScript** strict mode
- **Prettier** for code formatting

## 📦 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/chainable-dev/chainable-guru.git
cd chainable-guru
```

2. **Install dependencies:**

```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install

# Using yarn
yarn install
```

3. **Set up environment variables:**

```bash
# Copy the example environment file
cp env.example .env.local
```

4. **Configure your environment variables in `.env.local`:**

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Vercel Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
VERCEL_URL=your_vercel_url_here

# AI Configuration
NEXT_PUBLIC_DEFAULT_MODEL=gpt-4o-mini
```

5. **Set up Supabase:**

- Create a new Supabase project
- Run the migrations in `supabase/migrations/`
- Configure authentication providers
- Set up storage buckets

6. **Start the development server:**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Biome
npm run lint:fix     # Fix linting issues

# Utilities
npm run clean        # Clean build artifacts
npm run security-audit  # Check for security vulnerabilities
npm run deps:check   # Check for outdated dependencies
npm run deps:update  # Update dependencies
```

### Project Structure

```
chainable-guru/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Chat interface routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── custom/           # Custom components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase configuration
│   ├── utils/            # Utility functions
│   └── editor/           # Editor configuration
├── ai/                   # AI-related code
├── db/                   # Database operations
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔒 Security

- All wallet interactions are read-only
- No private keys are stored or transmitted
- Data is encrypted at rest
- Regular security audits
- Comprehensive error handling
- Content Security Policy headers
- XSS protection

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for hosting and deployment
- [Supabase](https://supabase.com) for database and authentication
- [OpenAI](https://openai.com) for AI capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🔄 Updates & Roadmap

### Latest Updates

- ✅ Upgraded to Next.js 15
- ✅ Fixed viewport metadata warnings
- ✅ Improved security configuration
- ✅ Enhanced TypeScript configuration
- ✅ Optimized build process

### Upcoming Features

- [ ] Enhanced NFT support
- [ ] Additional AI model integrations
- [ ] Improved code generation
- [ ] Advanced document editing
- [ ] Extended blockchain support
- [ ] Real-time collaboration
- [ ] Mobile app support

## 💬 Support

For support, please:

1. Check the [Documentation](./docs)
2. Search [Issues](https://github.com/chainable-dev/chainable-guru/issues)
3. Open a new issue if needed

## 📊 Project Status

- **Build Status:** ✅ Passing
- **TypeScript:** ✅ No errors
- **Linting:** ✅ Clean
- **Security:** ✅ Audited
- **Performance:** ✅ Optimized

---

Built with ❤️ using Next.js, Supabase, and OpenAI