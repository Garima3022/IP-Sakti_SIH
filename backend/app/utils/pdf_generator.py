import datetime
from typing import Dict, Any

class DossierGenerator:
    """
    Generates branded HTML/Print-Ready Compliance Dossiers for DR. Ayurvedic Sathi formulations.
    """

    def generate_html_dossier(self, formula: Dict[str, Any], audit: Dict[str, Any], cites_data: Dict[str, Any], sec3p_data: Dict[str, Any], export_data: Dict[str, Any]) -> str:
        date_str = datetime.datetime.utcnow().strftime("%B %d, %Y")
        formula_title = formula.get("title", "Ayurvedic Formulation")
        ref = formula.get("classical_reference", "Ayurvedic Pharmacopoeia of India")
        indications = formula.get("indications", "General Wellness & Balance")
        ingredients = formula.get("ingredients", [])

        ingredients_rows = ""
        for ing in ingredients:
            name = ing.get("name", "")
            bot = ing.get("botanical_name", "")
            sans = ing.get("sanskrit_name", "")
            pct = ing.get("percentage", "")
            part = ing.get("part_used", "")
            ingredients_rows += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>{sans or name}</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-style: italic;">{bot}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{pct}%</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{part}</td>
            </tr>
            """

        cites_status = cites_data.get("status", "CLEAN")
        status_color = "#059669" if cites_status == "CLEAN" else ("#d97706" if cites_status == "WARNING" else "#dc2626")

        cites_rows = ""
        for flag in cites_data.get("flagged_botanicals", []):
            pratinidhi = flag.get("pratinidhi_dravya", {})
            cites_rows += f"""
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-bottom: 12px; border-radius: 4px;">
                <h4 style="margin: 0 0 6px 0; color: #991b1b;">⚠️ Endangered Plant Detected: {flag.get('botanical_name')} ({flag.get('sanskrit_name')})</h4>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>CITES Status:</strong> {flag.get('cites_appendix')} | <strong>Wildlife Act:</strong> {flag.get('wildlife_act_schedule')}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Legal Constraint:</strong> {flag.get('legal_status')}</p>
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; margin-top: 8px; border-radius: 4px;">
                    <strong style="color: #166534;">🌿 Recommended Pratinidhi Dravya (Ayurvedic Bio-Substitute):</strong>
                    <span style="font-weight: bold; color: #15803d;"> {pratinidhi.get('alternative_sanskrit_name')} ({pratinidhi.get('alternative_name')})</span>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #166534;">{pratinidhi.get('justification')}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #15803d; font-style: italic;">Ref: {pratinidhi.get('pharmacopoeia_reference')}</p>
                </div>
            </div>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>DR. Ayurvedic Sathi - Official Compliance Dossier</title>
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background-color: #f8fafc; }}
                .container {{ max-width: 850px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
                .header {{ border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }}
                .logo-title {{ font-size: 28px; font-weight: 800; color: #065f46; letter-spacing: -0.5px; margin: 0; }}
                .subtitle {{ font-size: 13px; color: #047857; text-transform: uppercase; font-weight: 700; margin-top: 4px; letter-spacing: 1px; }}
                .meta-table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }}
                .meta-table td {{ padding: 6px 12px; border: 1px solid #e2e8f0; }}
                .meta-label {{ background-color: #f1f5f9; font-weight: 600; width: 30%; }}
                .section-title {{ font-size: 18px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; margin-bottom: 14px; }}
                .badge {{ display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: white; }}
                .footer {{ border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo-title">🌿 DR. Ayurvedic Sathi</div>
                    <div class="subtitle">AI Assistant for Ayurveda IP & Regulatory Guidance (Ministry of Ayush - SIH IP-SAKTI Sahayak)</div>
                    <p style="margin-top: 10px; font-size: 12px; color: #64748b;">Official Compliance Dossier & Regulatory Audit Report</p>
                </div>

                <table class="meta-table">
                    <tr>
                        <td class="meta-label">Formulation Title</td>
                        <td><strong>{formula_title}</strong></td>
                    </tr>
                    <tr>
                        <td class="meta-label">Classical Reference</td>
                        <td>{ref}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Indications</td>
                        <td>{indications}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Dossier Generated Date</td>
                        <td>{date_str}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">CITES Screening Status</td>
                        <td><span class="badge" style="background-color: {status_color};">{cites_status}</span></td>
                    </tr>
                    <tr>
                        <td class="meta-label">Section 3(p) Patent Risk</td>
                        <td><strong>{sec3p_data.get('sec_3p_risk_level', 'MODERATE')}</strong> (Score: {sec3p_data.get('sec_3p_risk_score', 50)}/100)</td>
                    </tr>
                </table>

                <div class="section-title">1. Formula Ingredients Breakdown</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; text-align: left;">
                            <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Sanskrit / Common Name</th>
                            <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Botanical Binomial</th>
                            <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Percentage</th>
                            <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Part Used</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients_rows}
                    </tbody>
                </table>

                <div class="section-title">2. CITES & Wildlife Protection Act Audit</div>
                {cites_rows if cites_rows else '<p style="color: #059669; font-size: 14px;">✅ Clean Formula: No endangered or CITES-restricted species detected.</p>'}

                <div class="section-title">3. Indian Patent Act §3(p) Synergy Analysis</div>
                <p style="font-size: 14px; line-height: 1.5;"><strong>Synergy Assessment:</strong> {sec3p_data.get('synergy_evaluation')}</p>
                <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <strong style="font-size: 13px;">Actionable Steps to Overcome Section 3(p):</strong>
                    <ul style="font-size: 13px; margin-top: 6px; padding-left: 20px;">
                        {''.join([f'<li style="margin-bottom: 4px;">{rec}</li>' for rec in sec3p_data.get('actionable_recommendations', [])])}
                    </ul>
                </div>

                <div class="section-title">4. International Regulatory Export Roadmap</div>
                <p style="font-size: 13px;"><strong>US FDA Route:</strong> Dietary Supplement DSHEA 1994 / Botanical Drug NDA</p>
                <p style="font-size: 13px;"><strong>EU EMA Route:</strong> THMPD Directive 2004/24/EC (30-year traditional use rule)</p>
                <p style="font-size: 13px;"><strong>GCC Route:</strong> Herbal & Traditional Medicine Registration with Heavy Metal Certification</p>

                <div class="footer">
                    <p>DR. Ayurvedic Sathi Compliance Dossier • Generated automatically via RAG & Regulatory Knowledge Engines</p>
                    <p>This report provides regulatory guidance and does not replace official advice from the Controller General of Patents or Ministry of Ayush.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html_content

dossier_generator = DossierGenerator()
