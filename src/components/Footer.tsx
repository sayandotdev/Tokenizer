import { Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-white dark:bg-[#020817]">
      <hr />
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        {/* Navigation Links */}
        <p className="flex flex-wrap items-center justify-center gap-1 text-center text-sm sm:text-base text-gray-900/80 dark:text-gray-400 mb-4 md:mb-0">
          <span className="font-semibold text-gray-800 dark:text-white">
            Tokenizer
          </span>
          <span>— Crafted with </span>
          <span className="font-semibold text-pink-600 dark:text-pink-400">
            Wisdom
          </span>
          <span>and</span>
          <span className="font-semibold text-yellow-500 dark:text-yellow-300">
            Guidance
          </span>
          <span>from amazing gurus ✨</span>
        </p>

        {/* Social Icons */}
        <div className="flex space-x-4">
          <a
            href="https://github.com/sayandotdev/Tokenizer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Github size={20} />
          </a>
          <a
            href="https://linkedin.com/sayandotdev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
