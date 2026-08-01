import { GithubLogoIcon } from "@phosphor-icons/react";
import iconSource from "../app/icon.webp";
import icon2Source from "../app/icon2.webp";

const footerLinks = {
  resources: [
    { name: "Documentation", href: "/docs/introduction" },
    {
      name: "Examples",
      href: "https://github.com/nemvince/axi/tree/main/examples",
    },
  ],
  community: [
    { name: "GitHub", href: "https://github.com/nemvince/axi" },
    {
      name: "Issues",
      href: "https://github.com/nemvince/axi/issues",
    },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 group">
            <img src={iconSource} className='h-10 w-10 opacity-100 group-hover:opacity-0 transition-opacity ease-in-out' />
            <img src={icon2Source} className='h-10 w-10 group-hover:opacity-100 opacity-0 -ml-12 transition-all group-hover:rotate-[20deg] group-hover:scale-125' />
            <span className="text-2xl font-semibold text-foreground">
              Axi
            </span>
          </a>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Fullstack's flow state. A full-stack framework built on Bun.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://github.com/nemvince/axi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <GithubLogoIcon className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Community</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border/40 pt-8">
          <p className="text-xs text-muted-foreground">
            Built with Axi.
          </p>
        </div>
      </div>
    </footer>
  );
}
