import { ArrowUpRight } from "lucide-react";

import { Button } from "../ui/button";

const withBase = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  if (path.startsWith("/")) return normalizedBase.replace(/\/$/, "") + path;
  return normalizedBase + path;
};

export function Footer() {
  const navigation = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const social = [
    { name: "LinkedIn", href: "https://linkedin.com" },
    { name: "X", href: "https://x.com" },
  ];

  const legal = [{ name: "Privacy Policy", href: "/privacy" }];

  return (
    <footer className="flex flex-col items-center gap-14 pt-24 lg:pt-32">
      <div className="container space-y-3 text-center">
        <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
          Ready to launch?
        </h2>
        <p className="text-muted-foreground mx-auto max-w-xl leading-snug text-balance">
          Ship a conversion-first site with tenant-aware branding — and manage it
          with a CMS.
        </p>
        <div>
          <Button size="lg" className="mt-4" asChild>
            <a href={withBase("/contact")}>Book a call</a>
          </Button>
        </div>
      </div>

      <nav className="container flex flex-col items-center gap-4">
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={withBase(item.href)}
                className="font-medium transition-opacity hover:opacity-75"
              >
                {item.name}
              </a>
            </li>
          ))}
          {social.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center gap-0.5 font-medium transition-opacity hover:opacity-75"
              >
                {item.name} <ArrowUpRight className="size-4" />
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {legal.map((item) => (
            <li key={item.name}>
              <a
                href={withBase(item.href)}
                className="text-muted-foreground text-sm transition-opacity hover:opacity-75"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="text-primary mt-10 w-full md:mt-14 lg:mt-20">
        <svg
          width="1570"
          height="293"
          viewBox="0 0 1570 293"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M642.357 112.457V368.321H677.656V112.457H642.357ZM641.853 45.3953C646.896 50.5539 652.947 53.1332 660.007 53.1332C667.067 53.1332 673.118 50.5539 678.16 45.3953C683.203 40.2368 685.724 33.8746 685.724 26.3087C685.724 18.3989 683.203 12.0366 678.16 7.22198C673.118 2.40733 667.067 0 660.007 0C652.611 0 646.392 2.40733 641.349 7.22198C636.642 12.0366 634.289 18.3989 634.289 26.3087C634.289 33.8746 636.811 40.2368 641.853 45.3953ZM1028.99 368.321V112.457H1064.29V368.321H1028.99ZM1046.64 53.1332C1039.58 53.1332 1033.53 50.5539 1028.48 45.3953C1023.44 40.2368 1020.92 33.8746 1020.92 26.3087C1020.92 18.3989 1023.27 12.0366 1027.98 7.22198C1033.02 2.40733 1039.24 0 1046.64 0C1053.7 0 1059.75 2.40733 1064.79 7.22198C1069.83 12.0366 1072.36 18.3989 1072.36 26.3087C1072.36 33.8746 1069.83 40.2368 1064.79 45.3953C1059.75 50.5539 1053.7 53.1332 1046.64 53.1332ZM1099.76 112.457V368.322H1135.05V235.747C1135.05 214.424 1138.42 196.541 1145.14 182.097C1152.2 167.653 1161.78 156.649 1173.88 149.083C1185.98 141.517 1199.6 137.734 1214.73 137.734C1236.58 137.734 1253.22 144.612 1264.65 158.368C1276.42 172.124 1282.3 193.102 1282.3 221.303V368.322H1317.6V217.176C1317.6 191.727 1313.56 170.921 1305.5 154.757C1297.43 138.25 1286.17 126.041 1271.71 118.131C1257.25 110.222 1240.28 106.267 1220.78 106.267C1201.95 106.267 1185.31 110.565 1170.86 119.163C1156.4 127.761 1144.97 140.141 1136.57 156.305H1135.05L1132.03 112.457H1099.76ZM1391.49 358.004C1409.64 369.009 1430.49 374.512 1454.02 374.512C1473.52 374.512 1490.66 371.073 1505.45 364.195C1520.25 356.973 1532.52 347.171 1542.27 334.791C1552.01 322.41 1558.91 308.482 1562.94 293.007H1528.65C1523.27 308.826 1514.19 321.207 1501.42 330.148C1488.64 339.09 1472.84 343.56 1454.02 343.56C1439.56 343.56 1425.61 339.949 1412.16 332.727C1399.05 325.162 1388.3 313.813 1379.89 298.681C1372.38 284.851 1368.23 268 1367.43 248.127H1569.5C1569.83 243.312 1570 239.014 1570 235.231V224.398C1570 203.763 1565.46 184.505 1556.38 166.622C1547.31 148.739 1534.2 134.295 1517.05 123.29C1499.91 111.941 1479.23 106.267 1455.03 106.267C1431.16 106.267 1409.98 111.769 1391.49 122.774C1373 133.779 1358.54 149.255 1348.12 169.201C1338.04 189.148 1332.99 212.705 1332.99 239.873C1332.99 267.042 1338.21 290.771 1348.63 311.061C1359.05 331.008 1373.34 346.656 1391.49 358.004Z"
            fill="url(#paint0_linear_59_191)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_59_191"
              x1="742.5"
              y1="0"
              x2="742.5"
              y2="218.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="currentColor" />
              <stop offset="1" stopColor="#F8F8F8" stopOpacity="0.41" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </footer>
  );
}