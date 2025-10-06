import logo from "../assets/images/logo.png";

interface Props {
  username: string;
  avatar: string;
  onClick: () => void;
}

export default function Topbar({ username, avatar, onClick }: Props) {
  return (
    <header className="mx-10 my-3 flex items-center justify-between">
      <span className="font-pixelify flex items-center gap-1" onClick={onClick}>
        <img src={avatar} alt="Avatar" className="h-5 w-5" />
        {username}
      </span>
      <img src={logo} alt="Logo" className="h-10 w-10" />
    </header>
  );
}
