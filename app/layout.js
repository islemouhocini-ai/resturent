import "./globals.css";
import SupportChat from "./components/SupportChat";

export const metadata = {
  title: "Rivolta Restaurant",
  description: "An editorial restaurant landing page built with Next.js."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
