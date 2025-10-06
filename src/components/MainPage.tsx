import StatPanel from "./StatPanel";
import Button from "./Button";
import Counter from "./Counter";

import dollarIcon from "../assets/images/dollar_icon.png";
import starIcon from "../assets/images/star_icon.png";
import diamondIcon from "../assets/images/diamond_icon.png";

interface Props {
  coins: number;
  currentLevel: number;
  earnPerTap: number;
  levelUpAt: number;
  isButtonFlipped: boolean;
  onClickCoin: () => void;
}

export default function MainPage({
  earnPerTap,
  levelUpAt,
  currentLevel,
  coins,
  isButtonFlipped,
  onClickCoin,
}: Props) {
  return (
    <>
      <section className="flex justify-center gap-2">
        <StatPanel title="Earn per tap" icon={dollarIcon} value={earnPerTap} />
        <StatPanel title="Level up at" icon={starIcon} value={levelUpAt} />
        <StatPanel
          title="Current level"
          icon={diamondIcon}
          value={currentLevel}
        />
      </section>

      <section className="flex items-center justify-center bg-[url('assets/images/coins.png')] bg-contain bg-center bg-no-repeat px-10 py-20">
        <Counter value={coins} />
      </section>

      <Button isFlipped={isButtonFlipped} onClick={onClickCoin} />
    </>
  );
}
