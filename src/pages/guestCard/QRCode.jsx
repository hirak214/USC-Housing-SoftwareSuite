import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

// Path of the public guest-card request form (see App.jsx route "/request-card")
const REQUEST_PATH = '/request-card';

const GuestCardQRCode = () => {
  // Default the target URL to this deployment's public request form.
  const defaultUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${REQUEST_PATH}`
      : REQUEST_PATH;

  const [requestUrl, setRequestUrl] = useState(defaultUrl);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Regenerate the QR PNG whenever the target URL changes.
  useEffect(() => {
    let cancelled = false;
    const url = requestUrl.trim();
    if (!url) {
      setQrDataUrl('');
      return;
    }

    setGenerating(true);
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 1024, // high-res so it stays crisp when printed or downloaded
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        if (!cancelled) setQrDataUrl('');
      })
      .finally(() => {
        if (!cancelled) setGenerating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestUrl]);

  // Option 1: download only the QR code as a PNG.
  const handleDownloadQr = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'guest-card-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrDataUrl]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(requestUrl.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }, [requestUrl]);

  // Option 2: print the whole poster on an A5 page.
  // Opens a self-contained window so the app's global print styles
  // (which force letter size + a tiny font) never interfere.
  const handlePrintPoster = useCallback(() => {
    if (!qrDataUrl) return;

    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) {
      alert('Please allow pop-ups for this site to print the poster.');
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Guest Card Request</title>
  <style>
    @page { size: A5 portrait; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
    }
    .page {
      width: 148mm;
      height: 210mm;
      margin: 0 auto;
      padding: 12mm 12mm 10mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .brand { font-size: 13pt; font-weight: 600; letter-spacing: 0.14em; color: #990000; text-transform: uppercase; }
    .brand-sub { font-size: 9pt; letter-spacing: 0.24em; color: #64748b; text-transform: uppercase; margin-top: 2mm; }
    .rule { width: 34mm; height: 2px; background: #990000; border-radius: 2px; margin: 5mm auto 0; }
    .headline { font-size: 26pt; font-weight: 600; line-height: 1.1; margin: 10mm 0 8mm; color: #1a1a1a; }
    .qr-frame {
      border: 2px solid #990000;
      border-radius: 8px;
      padding: 6mm;
      background: #ffffff;
    }
    .qr-frame img { display: block; width: 82mm; height: 82mm; }
    .steps { margin: 9mm 0 0; padding: 0; list-style: none; text-align: left; max-width: 108mm; }
    .steps li { display: flex; align-items: flex-start; font-size: 11pt; color: #334155; margin-bottom: 3.5mm; }
    .steps .num {
      flex: 0 0 auto; width: 7mm; height: 7mm; border-radius: 50%;
      background: #990000; color: #fff; font-weight: 600; font-size: 9pt;
      display: flex; align-items: center; justify-content: center; margin-right: 3mm;
    }
    .footer { font-size: 8.5pt; color: #94a3b8; margin-top: auto; padding-top: 5mm; }
  </style>
</head>
<body>
  <div class="page">
    <div class="brand">USC Housing</div>
    <div class="brand-sub">Guest Card</div>
    <div class="rule"></div>

    <h1 class="headline">Request Your<br/>Guest Card</h1>

    <div class="qr-frame">
      <img src="${qrDataUrl}" alt="Guest card request QR code" />
    </div>

    <ol class="steps">
      <li><span class="num">1</span><span>Scan the QR code.</span></li>
      <li><span class="num">2</span><span>Fill in your name, email, and phone number.</span></li>
      <li><span class="num">3</span><span>Collect your card at the front desk.</span></li>
    </ol>

    <div class="footer">USC Housing</div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.focus(); window.print(); }, 150);
    };
    window.onafterprint = function () { window.close(); };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }, [qrDataUrl, requestUrl]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="display-title text-2xl">Guest card QR code</h1>
        <p className="text-sm text-slate-500 mt-1">
          Print or display this code so guests can open the request form on their phone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-content">
              <label htmlFor="requestUrl" className="form-label">
                Request form URL
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="requestUrl"
                  type="url"
                  value={requestUrl}
                  onChange={(e) => setRequestUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://example.com/request-card"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Copy URL"
                  className="btn-secondary px-3"
                >
                  {copied ? (
                    <CheckIcon className="h-5 w-5 text-cardinal-600" />
                  ) : (
                    <ClipboardDocumentIcon className="h-5 w-5 text-slate-600" />
                  )}
                </button>
              </div>
              {requestUrl.trim() !== defaultUrl && (
                <button
                  type="button"
                  onClick={() => setRequestUrl(defaultUrl)}
                  className="mt-2 text-xs text-cardinal-700 hover:underline"
                >
                  Reset to default
                </button>
              )}
              <a
                href={requestUrl.trim() || REQUEST_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm text-cardinal-700 hover:underline"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                Open request form in a new tab
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-content space-y-3">
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!qrDataUrl}
                className="btn-secondary w-full"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download QR code (PNG)
              </button>
              <button
                type="button"
                onClick={handlePrintPoster}
                disabled={!qrDataUrl}
                className="btn-primary w-full"
              >
                <PrinterIcon className="h-5 w-5" />
                Print poster (A5)
              </button>
            </div>
          </div>
        </div>

        {/* Live poster preview */}
        <div className="lg:col-span-3">
          <div className="bg-slate-100 rounded-lg p-6 flex items-center justify-center">
            <div
              className="bg-white shadow-card rounded-md w-full max-w-sm mx-auto flex flex-col items-center text-center"
              style={{ aspectRatio: '148 / 210', padding: '8%' }}
            >
              <div className="text-cardinal-600 font-semibold uppercase tracking-widest text-sm">
                USC Housing
              </div>
              <div className="text-slate-500 uppercase tracking-[0.2em] text-[10px] mt-1">
                Guest Card
              </div>
              <div className="w-16 h-0.5 bg-cardinal-600 rounded mt-3" />

              <h2 className="text-2xl font-semibold text-slate-900 leading-tight mt-6 mb-6">
                Request Your Guest Card
              </h2>

              <div className="border-2 border-cardinal-600 rounded-lg p-3 bg-white">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Guest card request QR code"
                    className="w-40 h-40 block"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-sm">
                    {generating ? 'Generating…' : 'No QR code'}
                  </div>
                )}
              </div>

              <ol className="text-left text-xs text-slate-600 space-y-2 mt-6 w-full max-w-[220px]">
                <li className="flex items-start">
                  <span className="flex-none w-5 h-5 rounded-full bg-cardinal-600 text-white text-[10px] font-semibold flex items-center justify-center mr-2">1</span>
                  Scan the QR code.
                </li>
                <li className="flex items-start">
                  <span className="flex-none w-5 h-5 rounded-full bg-cardinal-600 text-white text-[10px] font-semibold flex items-center justify-center mr-2">2</span>
                  Fill in your name, email, and phone number.
                </li>
                <li className="flex items-start">
                  <span className="flex-none w-5 h-5 rounded-full bg-cardinal-600 text-white text-[10px] font-semibold flex items-center justify-center mr-2">3</span>
                  Collect your card at the front desk.
                </li>
              </ol>

              <div className="mt-auto text-[9px] text-slate-400 pt-4">
                USC Housing
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-3">
            A5 poster preview
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestCardQRCode;
