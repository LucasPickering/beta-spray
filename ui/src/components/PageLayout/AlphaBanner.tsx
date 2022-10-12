import { Link, Toolbar } from "@mui/material";

const AlphaBanner: React.FC = () => (
  <Toolbar
    sx={({ palette }) => ({
      padding: 1,
      backgroundColor: palette.warning.main,
      color: palette.getContrastText(palette.warning.main),
    })}
  >
    <span>
      This is an <strong>alpha</strong>. It's slow, buggy, and easy to abuse.
      The goal is to <strong>collect feedback</strong>, so{" "}
      <Link href="/about" color="secondary.dark">
        let me know what you think.
      </Link>
    </span>
  </Toolbar>
);

export default AlphaBanner;
