import { motion } from 'framer-motion';
import Image from 'next/image';
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
        <div className="flex flex-row justify-center gap-4 items-center">
          <Image 
            src="/logos/favi.ico"
            alt="App Logo"
            width={40}
            height={40}
          />
        </div>
        <p>
          Welcome to Chainable - bridging the gap between Web3 and AI. Our platform
          represents the next evolution in blockchain interaction, where complex
          crypto operations become as intuitive as having a conversation.
        </p>
        <p>
          Built with Next.js and powered by advanced AI capabilities, Chainable seamlessly
          integrates natural language processing with blockchain technology. Our mission
          is to make Web3 accessible to everyone by translating technical blockchain
          operations into simple, conversational commands. Whether you&apos;re managing
          wallets, executing trades, or deploying smart contracts, our AI assistant
          guides you through each step.
        </p>
        <p>
          Join us at{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://chainable.co"
            target="_blank"
          >
            Chainable
          </Link>{' '}
          as we reshape the future of Web3 interaction. Experience how AI can transform
          blockchain complexity into conversational simplicity, making crypto
          accessible for both newcomers and experienced users alike.
        </p>
      </div>
    </motion.div>
  );
};
