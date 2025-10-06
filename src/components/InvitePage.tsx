import Panel from "./Panel";

export default function MainPage() {
  return (
    <>
      <Panel>
        <span className="w-full p-5 text-center text-3xl">
          Invite a <span className="font-pixelify font-bold">pavlik</span> and{" "}
          <span className="font-pixelify font-bold">brainrot</span> together!
        </span>
      </Panel>

      <Panel>
        <div className="flexs min-h-65 w-full flex-col divide-y divide-white/40">
          <div className="flex flex-col justify-center p-5 text-center">
            <span className="text-xl font-semibold">
              <span className="font-pixelify font-bold">Pavlik</span>, who
              invited <span className="font-pixelify font-bold">you</span>:
            </span>

            <span className="font-pixelify">@arsenii_m</span>
          </div>

          <div className="flex flex-col justify-center p-5 text-center">
            <span className="text-xl font-semibold">
              <span className="font-pixelify font-bold">Pavlik, you</span> have
              invited:
            </span>

            <span className="font-pixelify">Nobody lol</span>
          </div>
        </div>
      </Panel>

      <Panel>
        <button
          onClick={() => alert("sike i haven't done it yet")}
          className="w-full py-7 text-center text-6xl font-black"
        >
          INVITE
        </button>
      </Panel>
    </>
  );
}
