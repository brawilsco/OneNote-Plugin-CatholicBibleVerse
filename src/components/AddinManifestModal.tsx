import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Code,
  CheckCircle2,
  FileCode,
  Sparkles,
  Github,
  Globe,
  ServerOff,
} from "lucide-react";

interface AddinManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddinManifestModal: React.FC<AddinManifestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"github" | "instructions" | "xml">("github");

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://username.github.io/catholic-onenote-studio";

  const manifestXmlSnippet = `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp 
  xmlns="http://schemas.microsoft.com/office/appforoffice/1.1" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:type="TaskPaneApp">
  <Id>b73d2a01-49b8-4c91-a1e4-8d9e26e3c509</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Catholic Scripture Studio</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Catholic Bible Quote Studio" />
  <Description DefaultValue="Search 73-book Catholic Bible quotes and insert stylish quote card images directly into OneNote pages." />
  <IconUrl DefaultValue="${currentUrl}/favicon.ico" />
  <HighResolutionIconUrl DefaultValue="${currentUrl}/favicon.ico" />
  <SupportUrl DefaultValue="${currentUrl}" />
  <AppDomains>
    <AppDomain>${currentUrl}</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Notebook" />
    <Host Name="Document" />
  </Hosts>
  <DefaultSettings>
    <SourceLocation DefaultValue="${currentUrl}" />
  </DefaultSettings>
  <Permissions>ReadWriteDocument</Permissions>
</OfficeApp>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestXmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([manifestXmlSnippet], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catholic-onenote-manifest.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E0D7D0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#4A1D1D] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight font-serif">
                GitHub Hosting & OneNote Add-in Setup
              </h2>
              <p className="text-xs text-[#E0D7D0]">
                100% Client-Side SPA — Catholic Bible (73 Books) & Zero Server Needed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E0D7D0] bg-[#F5F2F0] px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("github")}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "github"
                ? "border-[#4A1D1D] text-[#4A1D1D] font-bold"
                : "border-transparent text-[#8C7B70] hover:text-[#2D2926]"
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Pages Hosting</span>
          </button>
          <button
            onClick={() => setActiveTab("instructions")}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "instructions"
                ? "border-[#4A1D1D] text-[#4A1D1D] font-bold"
                : "border-transparent text-[#8C7B70] hover:text-[#2D2926]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>OneNote Sideloading</span>
          </button>
          <button
            onClick={() => setActiveTab("xml")}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "xml"
                ? "border-[#4A1D1D] text-[#4A1D1D] font-bold"
                : "border-transparent text-[#8C7B70] hover:text-[#2D2926]"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Manifest XML</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 text-xs text-[#2D2926] space-y-4">
          {activeTab === "github" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                <ServerOff className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">
                    Zero Server Backend Required
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    This entire Catholic Scripture Studio compiles into pure static HTML/JS/CSS assets with relative base paths (<code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">./</code>). It runs directly in the user's browser, connects to public CORS Bible APIs, and can be hosted for free on <strong>GitHub Pages</strong>.
                  </p>
                </div>
              </div>

              {/* Step by step for GitHub Pages */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Push Code to GitHub</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      Export or push this repository to your GitHub account (e.g. <code className="bg-[#F5F2F0] px-1 py-0.5 rounded text-[#4A1D1D] border border-[#E0D7D0]">github.com/your-username/catholic-bible-studio</code>).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Build Static Production Files</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      Run <code className="bg-[#F5F2F0] px-1 py-0.5 rounded text-[#4A1D1D] border border-[#E0D7D0]">npm run build</code>. Vite outputs all standalone static assets into the <code className="bg-[#F5F2F0] px-1 py-0.5 rounded text-[#4A1D1D] border border-[#E0D7D0]">dist/</code> directory.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Enable GitHub Pages in Repository Settings</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      In your GitHub repository, go to <strong>Settings</strong> → <strong>Pages</strong> → set <strong>Build and deployment</strong> to <em>GitHub Actions</em> (or deploy from <em>gh-pages</em> branch).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Use as Web App or Sideload into OneNote</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      Your Catholic Scripture Studio is immediately live on your GitHub URL (<code className="bg-[#F5F2F0] px-1 py-0.5 rounded text-[#4A1D1D] border border-[#E0D7D0]">https://username.github.io/repo-name/</code>). Sideload the generated manifest to dock it in OneNote!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "instructions" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FAF9F8] rounded-xl border border-[#E0D7D0] flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#4A1D1D]">
                    Run in real Microsoft OneNote Taskpane
                  </p>
                  <p className="text-[11px] text-[#635B55] mt-0.5 leading-relaxed">
                    This web app is 100% compatible with Office.js Taskpane. Sideloading the manifest opens this Catholic scripture studio right inside your OneNote sidebar, allowing 1-click insertion into any notebook page.
                  </p>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Download Manifest XML</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      Click the button below to download <code className="bg-[#F5F2F0] px-1 py-0.5 rounded text-[#4A1D1D] border border-[#E0D7D0]">catholic-onenote-manifest.xml</code> configured for this app.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Open OneNote on the Web or Desktop</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      Navigate to <a href="https://onenote.com" target="_blank" rel="noreferrer" className="text-[#4A1D1D] underline font-medium">OneNote.com</a>, open any notebook, and click the <strong>Insert</strong> tab on the ribbon.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Upload My Add-in</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      Click <strong>Office Add-ins</strong> → choose <strong>Manage My Add-ins</strong> → <strong>Upload My Add-in</strong> → browse to the downloaded XML manifest.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A1D1D] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2926]">Insert Catholic Scripture Cards</p>
                    <p className="text-[11px] text-[#8C7B70] mt-0.5">
                      The Catholic Scripture Studio taskpane will open alongside your notes. Click <strong>Insert Image into Page</strong> to place cards directly into your notebooks!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "xml" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8C7B70] uppercase">
                  manifest.xml preview
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[#4A1D1D] font-semibold hover:text-[#3B1717]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#107C41]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy XML"}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-[#2D2926] text-[#FAF9F8] rounded-xl text-[11px] font-mono overflow-x-auto max-h-64 border border-[#4A1D1D]/30">
                {manifestXmlSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F5F2F0] border-t border-[#E0D7D0] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#635B55] hover:bg-[#E0D7D0]/50 rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-[#D1C7BD] hover:bg-[#FAF9F8] text-[#2D2926] rounded-md transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-[#107C41]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard" : "Copy Manifest XML"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#4A1D1D] hover:bg-[#3B1717] text-white rounded-md transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Download manifest.xml</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
