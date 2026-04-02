import type { SxProps, Theme } from '@mui/material';
import Avatar from '@mui/material/Avatar';

function stringToColor(string: string) {
  let hash = 0;

  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function stringAvatar(name: string) {
  if (!name) return { sx: {}, children: "?" };

  const nameParts = name.split(" ");

  const firstInitial = nameParts[0][0]?.toUpperCase() || "";
  const secondInitial = nameParts[1]?.[0]?.toUpperCase() || "";

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${firstInitial}${secondInitial}`,
  };
}

type LetterAvatarProps = {
  name: string;
  sx?: SxProps<Theme>;
};

export function LetterAvatar({ name, sx }: LetterAvatarProps) {
  const avatar = stringAvatar(name);

  return (
    <Avatar
      {...avatar}
      sx={{
        ...avatar.sx,
        ...sx
      }}
    />
  );
}