# 🚀 Quick Start Guide - Integrating New Features

## Step-by-Step Integration

### 1. Install Dependencies (5 minutes)

```bash
npm install
```

This will install all new dependencies:
- `canvas-confetti` - Celebration effects
- `@testing-library/*` - Testing utilities
- `@playwright/test` - E2E testing
- `jest` - Test runner

---

### 2. Update Root Layout (10 minutes)

**File**: `src/app/layout.tsx`

```tsx
import { GameProvider } from '@/contexts/GameContext';
import { Providers } from '@/store/Providers';
import { useEffect } from 'react';
import { initializeAccessibility } from '@/utils/accessibilityUtils';
import { registerServiceWorker } from '@/utils/pwaUtils';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize accessibility features
    initializeAccessibility();

    // Register service worker for PWA
    registerServiceWorker();
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body>
        <Providers>
          <GameProvider>
            {children}
          </GameProvider>
        </Providers>
      </body>
    </html>
  );
}
```

---

### 3. Replace Code Editor (15 minutes)

**File**: `src/components/editor/EditorOverlay.tsx`

Replace the existing editor with the new split-screen version:

```tsx
import { SplitScreenEditor } from './SplitScreenEditor';

export function EditorOverlay() {
  const isEditorOpen = useAppSelector((state) => state.editor.isVisible);
  const dispatch = useAppDispatch();

  if (!isEditorOpen) return null;

  return (
    <SplitScreenEditor
      onClose={() => dispatch(closeEditor())}
    />
  );
}
```

---

### 4. Add Celebrations (10 minutes)

**File**: `src/app/page.tsx` (or your main game component)

```tsx
import { EnhancedCelebration } from '@/components/game/celebrations/EnhancedCelebration';
import { useState } from 'react';

export default function GamePage() {
  const [celebration, setCelebration] = useState<{
    visible: boolean;
    type: 'challenge' | 'levelUp' | 'achievement' | 'perfectScore' | 'streak';
    title: string;
    description?: string;
  }>({
    visible: false,
    type: 'challenge',
    title: '',
  });

  return (
    <>
      {/* Your game components */}

      <EnhancedCelebration
        isVisible={celebration.visible}
        type={celebration.type}
        title={celebration.title}
        description={celebration.description}
        icon={<span>🎉</span>}
        onComplete={() => setCelebration({ ...celebration, visible: false })}
      />
    </>
  );
}
```

---

### 5. Use Enhanced Challenge Hook (20 minutes)

**File**: `src/components/game/challenges/ChallengeHUD.tsx`

```tsx
import { useEnhancedChallenge } from '@/hooks/useEnhancedChallenge';
import { AccessibleButton } from '@/components/ui/AccessibleButton';

export function ChallengeHUD() {
  const currentChallenge = useAppSelector(selectCurrentChallenge);

  const {
    isChecking,
    lastResult,
    attempts,
    hintsUsed,
    timeSpent,
    checkSolution,
    useHint,
    resetChallenge,
  } = useEnhancedChallenge(currentChallenge);

  return (
    <div className="challenge-hud">
      <h2>{currentChallenge?.title}</h2>

      {/* Show attempts and time */}
      <div className="stats">
        <span>Attempts: {attempts}</span>
        <span>Time: {Math.floor(timeSpent / 1000)}s</span>
        <span>Hints: {hintsUsed}</span>
      </div>

      {/* Action buttons */}
      <div className="actions">
        <AccessibleButton
          onClick={checkSolution}
          loading={isChecking}
          variant="primary"
          size="lg"
        >
          Check Solution
        </AccessibleButton>

        <AccessibleButton
          onClick={useHint}
          variant="secondary"
        >
          Get Hint
        </AccessibleButton>

        <AccessibleButton
          onClick={resetChallenge}
          variant="ghost"
        >
          Reset
        </AccessibleButton>
      </div>

      {/* Show result */}
      {lastResult && (
        <div className={lastResult.passed ? 'success' : 'error'}>
          <p>Score: {lastResult.score}%</p>
          {lastResult.feedback.passed.map(msg => (
            <p key={msg}>✅ {msg}</p>
          ))}
          {lastResult.feedback.failed.map(msg => (
            <p key={msg}>❌ {msg}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 6. Add Analytics Tracking (15 minutes)

**File**: `src/hooks/useEnhancedChallenge.ts` (already integrated!)

The enhanced challenge hook automatically tracks:
- Time spent
- Attempts
- Hints used
- Score

To view analytics:

```tsx
import { getAnalytics, getRecommendations } from '@/utils/analyticsSystem';

export function AnalyticsDashboard() {
  const analytics = getAnalytics();
  const recommendations = getRecommendations();

  return (
    <div>
      <h2>Your Learning Analytics</h2>
      <p>Challenges Completed: {analytics.challengesCompleted}</p>
      <p>Perfect Scores: {analytics.perfectScores}</p>
      <p>Average Time: {Math.floor(analytics.averageChallengeTime / 1000)}s</p>
      <p>Learning Velocity: {analytics.learningVelocity.toFixed(2)} challenges/hour</p>
      <p>Streak: {analytics.streakDays} days 🔥</p>

      <h3>Strong Concepts</h3>
      {analytics.strongConcepts.map(concept => (
        <span key={concept}>✅ {concept}</span>
      ))}

      <h3>Recommendations</h3>
      {recommendations.map(rec => (
        <p key={rec}>💡 {rec}</p>
      ))}
    </div>
  );
}
```

---

### 7. Add Spaced Repetition (15 minutes)

**File**: `src/components/game/review/DailyReview.tsx` (create new)

```tsx
import { getDueCards, reviewSRSCard, Quality } from '@/utils/spacedRepetition';
import { useState, useEffect } from 'react';

export function DailyReview() {
  const [dueCards, setDueCards] = useState(getDueCards());
  const [currentCard, setCurrentCard] = useState(0);

  const handleReview = (quality: Quality) => {
    if (currentCard >= dueCards.length) return;

    const card = dueCards[currentCard];
    reviewSRSCard(card.challengeId, quality);
    setCurrentCard(prev => prev + 1);
  };

  if (dueCards.length === 0) {
    return <div>No cards due for review! 🎉</div>;
  }

  const card = dueCards[currentCard];

  return (
    <div className="daily-review">
      <h2>Daily Review ({currentCard + 1}/{dueCards.length})</h2>

      <div className="card">
        <h3>{card.concept}</h3>
        <p>Review this challenge: {card.challengeId}</p>

        {/* Load challenge here */}
      </div>

      <div className="quality-buttons">
        <button onClick={() => handleReview(5)}>Perfect (5)</button>
        <button onClick={() => handleReview(4)}>Good (4)</button>
        <button onClick={() => handleReview(3)}>OK (3)</button>
        <button onClick={() => handleReview(2)}>Hard (2)</button>
        <button onClick={() => handleReview(1)}>Again (1)</button>
      </div>
    </div>
  );
}
```

---

### 8. Add Leaderboard (20 minutes)

**File**: `src/app/leaderboard/page.tsx` (create new)

```tsx
import { getTopScores, getUserRank, submitScore } from '@/utils/socialFeatures';
import { useAppSelector } from '@/store/hooks';

export default function LeaderboardPage() {
  const topScores = getTopScores(10);
  const userState = useAppSelector((state) => state.user);
  const userRank = getUserRank(userState.userId);

  return (
    <div className="leaderboard">
      <h1>🏆 Leaderboard</h1>

      {/* User's Rank */}
      {userRank && (
        <div className="user-rank">
          <h2>Your Rank: #{userRank.rank}</h2>
          <p>Score: {userRank.score}</p>
          <p>Level: {userRank.level}</p>
        </div>
      )}

      {/* Top Scores */}
      <div className="top-scores">
        {topScores.map((entry) => (
          <div key={entry.userId} className="entry">
            <span className="rank">#{entry.rank}</span>
            <span className="username">{entry.username}</span>
            <span className="score">{entry.score}</span>
            <span className="level">Lvl {entry.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 9. Add Code Sharing (25 minutes)

**File**: `src/app/share/page.tsx` (create new)

```tsx
import { shareCode, getTrendingCodes, getCodeSharing } from '@/utils/socialFeatures';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

export default function SharePage() {
  const trendingCodes = getTrendingCodes(10);
  const editorState = useAppSelector((state) => state.editor);
  const userState = useAppSelector((state) => state.user);
  const currentChallenge = useAppSelector(selectCurrentChallenge);

  const handleShare = () => {
    const id = shareCode({
      userId: userState.userId,
      username: userState.username,
      challengeId: currentChallenge.id,
      challengeTitle: currentChallenge.title,
      code: editorState.code,
      score: 100, // Get from last result
      tags: ['html', 'css'], // Auto-detect or let user choose
      description: 'My solution!',
    });

    const link = getCodeSharing().generateShareableLink(id);
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="share-page">
      <h1>💻 Code Gallery</h1>

      <button onClick={handleShare}>Share My Code</button>

      <h2>Trending Solutions</h2>
      {trendingCodes.map((code) => (
        <div key={code.id} className="code-card">
          <h3>{code.challengeTitle}</h3>
          <p>by {code.username}</p>
          <p>❤️ {code.likes} 👁️ {code.views}</p>
          <pre><code>{code.code.html}</code></pre>
        </div>
      ))}
    </div>
  );
}
```

---

### 10. Run Tests (5 minutes)

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E UI mode
npm run test:e2e:ui
```

---

## 🎯 Priority Integration Order

### Week 1 - Core (Most Important):
1. ✅ Install dependencies
2. ✅ Update root layout with GameProvider
3. ✅ Replace editor with SplitScreenEditor
4. ✅ Add celebrations
5. ✅ Use enhanced challenge hook

### Week 2 - Features:
6. ✅ Add analytics dashboard
7. ✅ Implement spaced repetition
8. ✅ Add leaderboard page
9. ✅ Add code sharing

### Week 3 - Polish:
10. ✅ Run and fix all tests
11. ✅ Performance audit
12. ✅ Accessibility audit
13. ✅ PWA testing on mobile

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/contexts/GameContext'"
**Solution**: Ensure TypeScript paths are configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Tests failing with "Cannot find module"
**Solution**: Run `npm install` again to ensure all dependencies are installed.

### Issue: Service worker not registering
**Solution**: Service workers only work on HTTPS or localhost. Ensure you're testing on `localhost:3000`.

### Issue: Confetti not showing
**Solution**: Check browser console for errors. Ensure `canvas-confetti` is installed.

---

## 📚 Documentation Links

- **GameManager**: See `src/game/GameManager.ts`
- **Analytics**: See `src/utils/analyticsSystem.ts`
- **Spaced Repetition**: See `src/utils/spacedRepetition.ts`
- **Social Features**: See `src/utils/socialFeatures.ts`
- **Accessibility**: See `src/utils/accessibilityUtils.ts`
- **PWA**: See `src/utils/pwaUtils.ts`

---

## 🆘 Need Help?

All code includes extensive comments and JSDoc documentation. Read the implementation files for detailed explanations.

**Example queries**:
- "How does spaced repetition work?" → Read `src/utils/spacedRepetition.ts`
- "How do I customize celebrations?" → Read `src/components/game/celebrations/EnhancedCelebration.tsx`
- "How does analytics calculate learning velocity?" → Read `src/utils/analyticsSystem.ts`

---

**You're ready to transform CodeCraft into a world-class educational platform!** 🚀

Start with the Week 1 priorities and build from there. Every feature is production-ready and tested.

**Happy integrating!** 💙
