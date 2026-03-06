import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESTA LINEA ES LA MAGIA

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bravence - Consultora Estratégica",
  description: "Potenciamos tu rentabilidad con datos, tecnología y visión humana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 
          Pre-hydration script: Forces ALL videos to autoplay the instant React injects them.
          Uses MutationObserver to catch videos the moment they appear in the DOM.
          This is the ONLY reliable way to autoplay in Next.js client components.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var found = 0;
                var EXPECTED = 2;
                function forcePlay(video) {
                  if (video._bravForced) return;
                  video._bravForced = true;
                  video.muted = true;
                  video.setAttribute('muted', '');
                  video.setAttribute('playsinline', '');
                  video.setAttribute('autoplay', '');
                  video.play().catch(function(){});
                  found++;
                  if (found >= EXPECTED && observer) {
                    observer.disconnect();
                    observer = null;
                  }
                }
                document.querySelectorAll('video').forEach(forcePlay);
                var observer = new MutationObserver(function(mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    var nodes = mutations[i].addedNodes;
                    for (var j = 0; j < nodes.length; j++) {
                      var node = nodes[j];
                      if (node.nodeName === 'VIDEO') forcePlay(node);
                      else if (node.querySelectorAll) {
                        var vids = node.querySelectorAll('video');
                        for (var k = 0; k < vids.length; k++) forcePlay(vids[k]);
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
                setTimeout(function() { if (observer) { observer.disconnect(); observer = null; } }, 5000);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
