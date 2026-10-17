import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

function Barcode({ value, width = 1.5, height = 40 }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      JsBarcode(barcodeRef.current, value, {
        format: 'CODE128',
        width: width,
        height: height,
        displayValue: true,
        fontSize: 12,
        margin: 0,
      });
    }
  }, [value, width, height]);

  return <svg ref={barcodeRef}></svg>;
}

export default Barcode;