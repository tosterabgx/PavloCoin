import Topbar from "./components/Topbar";
import MainPage from "./components/MainPage";
import InvitePage from "./components/InvitePage";

import { useState, useMemo, useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";

import ghost from "./assets/images/ghost.png";

export default function App() {
  const { tg, user } = useTelegram();

  useEffect(() => {
    tg.ready();
  }, [tg]);

  const [isMainPage, setMainPage] = useState(true);

  const [coins, setCoins] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isButtonFlipped, flipButton] = useState(false);

  const earnPerTap = useMemo(() => 2 ** currentLevel, [currentLevel]);
  const levelUpAt = useMemo(() => 10 ** (currentLevel + 1), [currentLevel]);

  function onClickCoin() {
    setCoins(coins + earnPerTap);

    if (coins + earnPerTap >= levelUpAt) {
      setCurrentLevel(currentLevel + 1);

      flipButton(!isButtonFlipped);

      if ("vibrate" in navigator) {
        navigator.vibrate(500);
      }
    }
  }

  const additionalBackground = !isMainPage
    ? "bg-[url('assets/images/coins2.png')]"
    : "";

  return (
    <div
      className={
        "flex h-screen w-screen flex-col bg-contain bg-center bg-no-repeat text-white " +
        additionalBackground
      }
    >
      <Topbar
        username={"@" + (user?.username ?? user?.first_name ?? "notfound")}
        avatar={user?.photo_url ?? ghost}
        onClick={() => setMainPage(!isMainPage)}
      />
      <main className="flex w-full flex-1 flex-col items-center justify-between pb-15">
        {isMainPage ? (
          <MainPage
            earnPerTap={earnPerTap}
            levelUpAt={levelUpAt}
            currentLevel={currentLevel}
            coins={coins}
            isButtonFlipped={isButtonFlipped}
            onClickCoin={onClickCoin}
          />
        ) : (
          <InvitePage />
        )}
      </main>
    </div>
  );
}
