import Panel from "./components/Panel";
import Button from "./components/Button";
import Counter from "./components/Counter";
import Topbar from "./components/Topbar";
import { useState, useMemo } from "react";

export default function App() {
  const [coins, setCoins] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isButtonFlipped, flipButton] = useState(false);

  const earnPerTap = useMemo(() => 2 ** currentLevel, [currentLevel]);
  const levelUpAt = useMemo(() => 10 ** (currentLevel + 1), [currentLevel]);

  function clickCoin() {
    setCoins(coins + earnPerTap);

    if (coins + earnPerTap >= levelUpAt) {
      setCurrentLevel(currentLevel + 1);

      flipButton(!isButtonFlipped);
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col text-white">
      <Topbar username="@username" />

      <main className="flex w-full flex-1 flex-col items-center justify-between">
        <section className="flex justify-center gap-2">
          <Panel title="Earn per tap" value={earnPerTap} />
          <Panel title="Level up at" value={levelUpAt} />
          <Panel title="Current level" value={currentLevel} />
        </section>

        <section className="flex items-center justify-center bg-[url('assets/images/coins.png')] bg-contain bg-center bg-no-repeat px-10 py-20">
          <Counter value={coins} />
        </section>

        <Button isFlipped={isButtonFlipped} onClick={clickCoin} />
      </main>
    </div>
  );
}
