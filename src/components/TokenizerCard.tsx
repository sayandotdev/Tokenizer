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
type ModeType = "encode" | "decode";

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
  const [mode, setMode] = useState<ModeType>("encode");
  const [decodedText, setDecodedText] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(text);
    }, 400);
    return () => clearTimeout(handler);
  }, [text]);

  const tokens: TokenInfo[] = useMemo(() => {
    if (!debouncedText.trim() || mode !== "encode") return [];
    try {
      if (model.startsWith("gpt")) {
        const enc = encodingForModel(model as TiktokenModel);
        const tokenIds = enc.encode(debouncedText);
        const decodedTokens = tokenIds.map((id) => enc.decode([id]));
        return tokenIds.map((id, idx) => ({ id, text: decodedTokens[idx] }));
      } else {
        return debouncedText.split(/\s+/).map((word, idx) => ({
          id: idx,
          text: word,
        }));
      }
    } catch (error) {
      console.error("Error tokenizing text:", error);
      return [];
    }
  }, [debouncedText, model, mode]);

  // Decode functionality
  useEffect(() => {
    if (mode === "decode" && debouncedText.trim()) {
      try {
        const tokenIds = debouncedText
          .split(/[\s,]+/)
          .map((t) => parseInt(t, 10))
          .filter((n) => !isNaN(n));
        if (tokenIds.length > 0 && model.startsWith("gpt")) {
          const enc = encodingForModel(model as TiktokenModel);
          setDecodedText(enc.decode(tokenIds));
        } else {
          setDecodedText("");
        }
      } catch (error) {
        console.error("Error decoding tokens:", error);
        setDecodedText("");
      }
    } else {
      setDecodedText("");
    }
  }, [debouncedText, mode, model]);

  const handleCopy = async () => {
    try {
      let textToCopy = "";

      if (mode === "encode") {
        // Only copy the token IDs
        textToCopy =
          displayMode === "numbered"
            ? tokens.map((t) => `${t.id}`).join("\n")
            : tokens.map((t) => `${t.id}`).join("\n");
      } else {
        textToCopy = decodedText;
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const renderTokens = () => {
    if (tokens.length === 0 && mode === "encode") {
      return (
        <p className="text-muted-foreground text-center py-8">
          No tokens to display. Enter some text above.
        </p>
      );
    }

    if (mode === "decode") {
      return decodedText ? (
        <div className="p-3 rounded-lg font-mono whitespace-pre-wrap">
          {decodedText}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No decoded text. Enter valid token IDs above.
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
          Encode and Decode tokens using different models
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pb-32 sm:pb-20">
        {/* Mode Switch */}
        <div className="flex justify-center space-x-2">
          <Button
            variant={mode === "encode" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("encode")}
          >
            Encode
          </Button>
          <Button
            variant={mode === "decode" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("decode")}
          >
            Decode
          </Button>
        </div>

        {/* Model choose  */}
        <ModelSelector model={model} setModel={setModel} />

        {/* Input Section */}
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Enter your text here..."
                : "Enter token IDs separated by spaces or commas..."
            }
            className="min-h-[120px] resize-none focus:ring-2 focus:ring-gray-600 focus:outline-none focus:border-none transition-colors duration-200"
          />
        </div>

        {mode === "encode" && <Separator />}

        {/* Stats Section */}
        {mode === "encode" && (
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
        )}

        {mode === "encode" && <Separator />}

        {/* Output Section */}
        <div className="space-y-4">
          {mode === "encode" && (
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
          )}

          {mode === "decode" && (
            <div className="flex justify-end">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 transition-all duration-200"
                disabled={!decodedText}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto p-4 bg-muted/50 rounded-lg border">
            {renderTokens()}
          </div>
        </div>
      </CardContent>
      <Footer />
    </Card>
  );
};

export default TokenizerCard;
