import logo from "../assets/images/logo.png";

interface Props {
  username: string;
}

export default function Topbar({ username }: Props) {
  return (
    <header className="mx-10 my-3 flex items-center justify-between">
      <span className="font-pixelify">{username}</span>
      <img src={logo} alt="Logo" className="h-10 w-10" />
    </header>
  );
}
