import nextra from "nextra";
import path from "path";

const withNextra = nextra({
  contentDirBasePath: "/docs",
  defaultShowCopyCode: true,
  codeHighlight: true,
});

const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.join(__dirname, "."),
  },
  env: {
    NEXT_PUBLIC_IS_EXAMPLES: "true",
  },
};

export default withNextra(nextConfig);
