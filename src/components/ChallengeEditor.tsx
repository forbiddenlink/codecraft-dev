"use client";

import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";
import { useState } from "react";
import { AccessibleButton } from "@/components/ui/AccessibleButton";

export interface ColonyChallenge {
  id: string;
  missionTitle: string;
  briefing: string; // in-world story text
  xpReward: number;
  files: Record<string, { code: string; readOnly?: boolean }>;
  template: "vanilla-ts" | "react-ts" | "node";
  successCondition?: string; // code that evaluates to boolean
}

function MissionConsole({ onSuccess }: { onSuccess?: () => void }) {
  const { sandpack } = useSandpack();
  return (
    <div className="flex items-center gap-2 rounded-b-md bg-zinc-950 px-4 py-2">
      <span className="text-xs text-zinc-400 font-mono">
        COLONY TERMINAL v2.1
      </span>
    </div>
  );
}

interface ChallengeEditorProps {
  challenge: ColonyChallenge;
  onComplete?: (challenge: ColonyChallenge) => void;
}

export function ChallengeEditor({
  challenge,
  onComplete,
}: ChallengeEditorProps) {
  const [completed, setCompleted] = useState(false);

  function handleComplete() {
    setCompleted(true);
    onComplete?.(challenge);
  }

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
      {/* Mission Briefing */}
      <div className="border-b border-zinc-800 bg-gradient-to-r from-cyan-950/50 to-zinc-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Mission
            </p>
            <h3 className="mt-0.5 text-lg font-bold text-white">
              {challenge.missionTitle}
            </h3>
          </div>
          <div className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400">
            +{challenge.xpReward} XP
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-400 italic">
          &ldquo;{challenge.briefing}&rdquo;
        </p>
      </div>

      <SandpackProvider
        template={challenge.template}
        files={challenge.files}
        theme={atomDark}
        options={{ recompileMode: "delayed", recompileDelay: 800 }}
      >
        <SandpackLayout>
          <SandpackCodeEditor
            style={{ height: 380 }}
            showLineNumbers
            showInlineErrors
          />
          <SandpackPreview
            style={{ height: 380 }}
            showOpenInCodeSandbox={false}
          />
        </SandpackLayout>
        <SandpackConsole style={{ height: 120 }} />
        <MissionConsole />
      </SandpackProvider>

      <div className="flex items-center justify-between border-t border-zinc-800 p-3">
        {completed ? (
          <span className="text-sm font-medium text-green-400">
            ✓ Mission Complete! +{challenge.xpReward} XP earned
          </span>
        ) : (
          <AccessibleButton
            size="sm"
            variant="primary"
            className="bg-cyan-600 hover:bg-cyan-500"
            onClick={handleComplete}
          >
            Submit Mission
          </AccessibleButton>
        )}
      </div>
    </div>
  );
}
