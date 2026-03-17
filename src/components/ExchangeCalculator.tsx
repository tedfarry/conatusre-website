import { useState, type FormEvent } from 'react';

interface CalculatorResults {
  gainRealized: number;
  taxDeferred: number;
  capitalGainsTax: number;
  stateTax: number;
  niit: number;
  deprecRecapture: number;
  totalTaxWithout: number;
  netProceedsWithout: number;
  fullEquityForward: number;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function ExchangeCalculator() {
  const [results, setResults] = useState<CalculatorResults | null>(null);

  function calculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const salePrice = Number(data.get('salePrice')) || 0;
    const originalBasis = Number(data.get('originalBasis')) || 0;
    const improvements = Number(data.get('improvements')) || 0;
    const deprecTaken = Number(data.get('deprecTaken')) || 0;
    const sellingCosts = Number(data.get('sellingCosts')) || 0;
    const mortgageBalance = Number(data.get('mortgageBalance')) || 0;
    const fedCapGainsRate = (Number(data.get('fedCapGainsRate')) || 15) / 100;
    const stateRate = (Number(data.get('stateRate')) || 13.3) / 100;

    const adjustedBasis = originalBasis + improvements - deprecTaken;
    const netSalePrice = salePrice - sellingCosts;
    const gainRealized = netSalePrice - adjustedBasis;
    const netProceeds = netSalePrice - mortgageBalance;

    // Tax calculations without exchange
    const capitalGainsTax = Math.max(0, (gainRealized - deprecTaken) * fedCapGainsRate);
    const deprecRecapture = deprecTaken * 0.25;
    const niit = gainRealized > 0 ? gainRealized * 0.038 : 0;
    const stateTax = Math.max(0, gainRealized * stateRate);
    const totalTaxWithout = capitalGainsTax + deprecRecapture + niit + stateTax;
    const netProceedsWithout = netProceeds - totalTaxWithout;

    setResults({
      gainRealized,
      taxDeferred: totalTaxWithout,
      capitalGainsTax,
      stateTax,
      niit,
      deprecRecapture,
      totalTaxWithout,
      netProceedsWithout,
      fullEquityForward: netProceeds,
    });
  }

  return (
    <div className="calc-container">
      <form onSubmit={calculate} className="calc-form">
        <div className="calc-section">
          <h3>Property Details</h3>
          <div className="calc-row">
            <div className="calc-field">
              <label htmlFor="salePrice">Sale Price</label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  type="number"
                  id="salePrice"
                  name="salePrice"
                  placeholder="500,000"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="calc-field">
              <label htmlFor="originalBasis">Original Purchase Price</label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  type="number"
                  id="originalBasis"
                  name="originalBasis"
                  placeholder="300,000"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
          <div className="calc-row">
            <div className="calc-field">
              <label htmlFor="improvements">Capital Improvements</label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  type="number"
                  id="improvements"
                  name="improvements"
                  placeholder="25,000"
                  min="0"
                  defaultValue="0"
                />
              </div>
            </div>
            <div className="calc-field">
              <label htmlFor="deprecTaken">Depreciation Taken</label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  type="number"
                  id="deprecTaken"
                  name="deprecTaken"
                  placeholder="40,000"
                  min="0"
                  defaultValue="0"
                />
              </div>
            </div>
          </div>
          <div className="calc-row">
            <div className="calc-field">
              <label htmlFor="sellingCosts">Selling Costs</label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  type="number"
                  id="sellingCosts"
                  name="sellingCosts"
                  placeholder="30,000"
                  min="0"
                  defaultValue="0"
                />
              </div>
            </div>
            <div className="calc-field">
              <label htmlFor="mortgageBalance">Mortgage Balance</label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  type="number"
                  id="mortgageBalance"
                  name="mortgageBalance"
                  placeholder="200,000"
                  min="0"
                  defaultValue="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="calc-section">
          <h3>Tax Rates</h3>
          <div className="calc-row">
            <div className="calc-field">
              <label htmlFor="fedCapGainsRate">Federal Capital Gains Rate (%)</label>
              <div className="input-suffix">
                <input
                  type="number"
                  id="fedCapGainsRate"
                  name="fedCapGainsRate"
                  defaultValue="15"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span>%</span>
              </div>
            </div>
            <div className="calc-field">
              <label htmlFor="stateRate">State Tax Rate (%)</label>
              <div className="input-suffix">
                <input
                  type="number"
                  id="stateRate"
                  name="stateRate"
                  defaultValue="13.3"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span>%</span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="calc-btn">Calculate Tax Deferral</button>
      </form>

      {results && (
        <div className="calc-results">
          <div className="result-hero">
            <div className="result-hero-item result-hero-item--highlight">
              <span className="result-label">Tax Deferred via 1031 Exchange</span>
              <span className="result-value result-value--accent">
                {formatter.format(results.taxDeferred)}
              </span>
            </div>
            <div className="result-hero-item">
              <span className="result-label">Full Equity Carried Forward</span>
              <span className="result-value">
                {formatter.format(results.fullEquityForward)}
              </span>
            </div>
          </div>

          <h3>Without 1031 Exchange</h3>
          <div className="result-breakdown">
            <div className="result-line">
              <span>Realized Gain</span>
              <span>{formatter.format(results.gainRealized)}</span>
            </div>
            <div className="result-line">
              <span>Federal Capital Gains Tax</span>
              <span className="result-negative">
                -{formatter.format(results.capitalGainsTax)}
              </span>
            </div>
            <div className="result-line">
              <span>Depreciation Recapture (25%)</span>
              <span className="result-negative">
                -{formatter.format(results.deprecRecapture)}
              </span>
            </div>
            <div className="result-line">
              <span>Net Investment Income Tax (3.8%)</span>
              <span className="result-negative">
                -{formatter.format(results.niit)}
              </span>
            </div>
            <div className="result-line">
              <span>State Tax</span>
              <span className="result-negative">
                -{formatter.format(results.stateTax)}
              </span>
            </div>
            <div className="result-line result-line--total">
              <span>Total Tax Liability</span>
              <span className="result-negative">
                -{formatter.format(results.totalTaxWithout)}
              </span>
            </div>
            <div className="result-line result-line--total">
              <span>Net Proceeds (After Tax)</span>
              <span>{formatter.format(results.netProceedsWithout)}</span>
            </div>
          </div>

          <div className="result-note">
            <p>
              <strong>Note:</strong> This calculator provides estimates for
              educational purposes only. Actual tax liability depends on your
              specific situation. Consult a qualified tax advisor and qualified
              intermediary before executing a 1031 exchange.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
