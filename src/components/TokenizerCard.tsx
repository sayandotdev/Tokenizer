import React, { useState, useMemo, useEffect } from "react";
import { Coffee, Copy, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ThemeToggle } from "./ui/theme-toggle";
import { encodingForModel, TiktokenModel } from "js-tiktoken";
import { ModelSelector } from "./ModelSelector";
import Footer from "./Footer";

type TokenDisplayMode = "badges" | "numbered";

interface TokenInfo {
  text: string;
  id: number;
}

const TokenizerCard: React.FC = () => {
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [displayMode, setDisplayMode] = useState<TokenDisplayMode>("badges");
  const [showTokenIndices, setShowTokenIndices] = useState(false);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(text);
    }, 400);
    return () => clearTimeout(handler);
  }, [text]);

  const tokens: TokenInfo[] = useMemo(() => {
    if (!debouncedText.trim()) return [];
    try {
      if (model.startsWith("gpt")) {
        const enc = encodingForModel(model as TiktokenModel);
        const tokenIds = enc.encode(debouncedText);
        const decodedTokens = tokenIds.map((id) => enc.decode([id]));
        return tokenIds.map((id, idx) => ({ id, text: decodedTokens[idx] }));
      } else {
        // Placeholder for non-OpenAI models
        return debouncedText.split(/\s+/).map((word, idx) => ({
          id: idx,
          text: word,
        }));
      }
    } catch (error) {
      console.error("Error tokenizing text:", error);
      return [];
    }
  }, [debouncedText, model]);

  const handleCopy = async () => {
    try {
      const textToCopy =
        displayMode === "numbered"
          ? tokens.map((t, i) => `${i + 1}. ${t.text} -> ${t.id}`).join("\n")
          : tokens.map((t) => `${t.text} -> ${t.id}`).join("\n");

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy tokens:", err);
    }
  };

  const renderTokens = () => {
    if (tokens.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">
          No tokens to display. Enter some text above.
        </p>
      );
    }

    if (displayMode === "badges") {
      return (
        <div className="flex flex-wrap gap-2">
          {tokens.map((token, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 text-sm bg-background border hover:bg-accent transition-colors duration-150"
            >
              {showTokenIndices && (
                <span className="text-xs text-muted-foreground mr-1">
                  {index + 1}:
                </span>
              )}
              {token.text} → {token.id}
            </Badge>
          ))}
        </div>
      );
    }

    if (displayMode === "numbered") {
      return (
        <div className="space-y-1 font-mono text-sm">
          {tokens.map((token, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-2 rounded hover:bg-accent transition-colors"
            >
              <span className="text-xs text-muted-foreground font-bold min-w-[2rem]">
                {index + 1}.
              </span>
              <span className="break-all">
                {token.text} → {token.id}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full rounded-none border-none">
      <CardHeader className="text-center space-y-0">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Coffee className="size-10 text-primary" />
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Chai Tokenizer
          </CardTitle>
        </div>
        <CardDescription className="text-lg text-gray-600">
          Tokenize your text using Different models
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Model choose  */}
        <ModelSelector model={model} setModel={setModel} />
        {/* Input Section */}
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="min-h-[120px] resize-none focus:ring-2 focus:ring-gray-600 focus:outline-none focus:border-none transition-colors duration-200"
          />
        </div>

        <Separator />

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg w-full">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tokens.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Tokens</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(tokens.map((t) => t.id)).size}
            </div>
            <div className="text-sm text-muted-foreground">Unique Tokens</div>
          </div>
        </div>

        <Separator />

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex items-center space-x-1">
              <Button
                variant={displayMode === "badges" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("badges")}
              >
                Badges
              </Button>
              <Button
                variant={displayMode === "numbered" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("numbered")}
              >
                Numbered
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowTokenIndices(!showTokenIndices)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                disabled={displayMode === "numbered"}
              >
                {showTokenIndices ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span>{showTokenIndices ? "Hide" : "Show"} Indices</span>
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 transition-all duration-200"
                disabled={tokens.length === 0}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-4 bg-muted/50 rounded-lg border">
            {renderTokens()}
          </div>
        </div>
      </CardContent>
      {/* <Separator /> */}
      <Footer />
    </Card>
  );
};

export default TokenizerCard;
