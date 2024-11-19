import { motion } from 'framer-motion';
import Link from 'next/link';


export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p>
          Welcome to Chainable Chat Bot - your AI-powered Web3 assistant. Built with
          Next.js and the latest Web3 technologies, this chatbot helps you interact
          with blockchain data and perform crypto operations seamlessly.
        </p>
        <p>
          Connect your wallet to access personalized features like balance checks,
          transaction history, and smart contract interactions. Our AI assistant
          will guide you through the complexities of Web3 with natural language
          understanding.
        </p>
        <p>
          Powered by{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://base.org"
            target="_blank"
          >
            Base
          </Link>{' '}
          and secured with{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://supabase.com"
            target="_blank"
          >
            Supabase
          </Link>
          , experience the future of blockchain interaction.
        </p>
      </div>
    </motion.div>
  );
};
