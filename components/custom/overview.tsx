import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const quotes = [
  "Building bridges in the Web3 ecosystem, one transaction at a time",
  "Empowering developers with seamless blockchain integration",
  "Simplifying complexity in the world of decentralized applications",
  "Where innovation meets blockchain technology",
  "Your trusted companion in the blockchain journey"
];

export const Overview = () => {
  const [currentQuote, setCurrentQuote] = useState('');

  useEffect(() => {
    const updateQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    };
    
    updateQuote();
    const interval = setInterval(updateQuote, 5 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col items-center gap-8 leading-relaxed text-center max-w-xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12">
            <Image
              src="/logos/elron.ico"
              alt="Elron Bot"
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-bold tracking-tight">Elron</h2>
            <p className="text-sm text-muted-foreground">
              Powered by{' '}
              <Link
                href="https://chainable.co"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                chainable.co
              </Link>
            </p>
          </div>
        </div>

        <p className="text-sm italic text-muted-foreground">
          &ldquo;{currentQuote}&rdquo;
        </p>

        <div className="space-y-4">
          <p>
            Welcome to Chainable Chat Bot - your AI-powered Web3 assistant. Built with
            Next.js and the latest Web3 technologies, this chatbot helps you interact
            with blockchain data and perform crypto operations seamlessly.
          </p>
          <p>
            Connect your wallet to access personalized features like balance checks,
            transaction history, and smart contract interactions.
          </p>
          <p>
            Powered by{' '}
            <Link
              className="font-medium underline underline-offset-4"
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Base
            </Link>{' '}
            and secured with{' '}
            <Link
              className="font-medium underline underline-offset-4"
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase
            </Link>
          </p>
        </div>

        <Link 
          href="https://chainable.co"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-[120px] h-[30px]"
        >
          <Image 
            src="/logos/favicon-dark.ico"
            alt="Chainable Logo"
            fill
            className="opacity-80 dark:opacity-100 object-contain hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>
    </motion.div>
  );
};
