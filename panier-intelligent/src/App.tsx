import { FormEvent, useMemo, useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3000/achats';

type PurchaseFormState = {
  productName: string;
  price: string;
  purchaseDate: string;
};

type FormErrorState = {
  productName?: string;
  price?: string;
  purchaseDate?: string;
  global?: string;
  success?: string;
};

type Purchase = {
  id: number;
  product: { id: number; name: string };
  price: string;
  purchaseDate: string;
  createdAt: string;
};

type TopProduct = {
  productName: string;
  count: number;
} | null;

type Tab = 'add' | 'history' | 'top' | 'bilan';

function App() {
  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const [activeTab, setActiveTab] = useState<Tab>('add');
  const [form, setForm] = useState<PurchaseFormState>({
    productName: '',
    price: '',
    purchaseDate: today,
  });
  const [errors, setErrors] = useState<FormErrorState>({});
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [topProduct, setTopProduct] = useState<TopProduct>(null);
  const [loadingTop, setLoadingTop] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loadingBilan, setLoadingBilan] = useState(false);
  const [purchaseCount, setPurchaseCount] = useState<number>(0);
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>(today);

  // Charger les données selon l'onglet actif
  useEffect(() => {
    if (activeTab === 'history') {
      loadPurchases();
    } else if (activeTab === 'top') {
      loadTopProduct();
    } else if (activeTab === 'bilan') {
      loadBilan();
    }
  }, [activeTab, periodStart, periodEnd]);

  const loadPurchases = async () => {
    setLoadingPurchases(true);
    try {
      const params = new URLSearchParams();
      if (periodStart) params.append('startDate', periodStart);
      if (periodEnd) params.append('endDate', periodEnd);
      const url = `${API_BASE}?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const loadTopProduct = async () => {
    setLoadingTop(true);
    try {
      const params = new URLSearchParams();
      if (periodStart) params.append('startDate', periodStart);
      if (periodEnd) params.append('endDate', periodEnd);
      const url = `${API_BASE}/top-produit?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          setTopProduct(null);
        } else {
          setTopProduct({ productName: data.productName, count: data.count });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du top produit:', error);
    } finally {
      setLoadingTop(false);
    }
  };

  const loadBilan = async () => {
    setLoadingBilan(true);
    try {
      const params = new URLSearchParams();
      if (periodStart) params.append('startDate', periodStart);
      if (periodEnd) params.append('endDate', periodEnd);
      
      // Charger le total et le nombre d'achats
      const [bilanResponse, purchasesResponse] = await Promise.all([
        fetch(`${API_BASE}/bilan?${params.toString()}`),
        fetch(`${API_BASE}?${params.toString()}`),
      ]);

      if (bilanResponse.ok) {
        const data = await bilanResponse.json();
        setTotalAmount(data.total || 0);
      }

      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchaseCount(purchasesData.length || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du bilan:', error);
    } finally {
      setLoadingBilan(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, global: undefined, success: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrorState = {};

    if (!form.productName.trim()) {
      newErrors.productName = 'Le nom du produit est obligatoire.';
    }

    if (!form.price) {
      newErrors.price = 'Le prix est obligatoire.';
    } else {
      const value = Number(form.price);
      if (Number.isNaN(value)) {
        newErrors.price = 'Le prix doit être un nombre.';
      } else if (value <= 0) {
        newErrors.price = 'Le prix doit être un nombre positif.';
      }
    }

    if (!form.purchaseDate) {
      newErrors.purchaseDate = "La date d'achat est obligatoire.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: form.productName.trim(),
          price: Number(form.price),
          purchaseDate: form.purchaseDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => undefined);
        const message =
          data?.message ??
          "Une erreur est survenue lors de l'ajout de l'achat.";
        setErrors({ global: Array.isArray(message) ? message.join(' ') : message });
        return;
      }

      setErrors({
        success: 'Achat ajouté avec succès.',
      });

      setForm({
        productName: '',
        price: '',
        purchaseDate: today,
      });

      // Recharger les données si on est sur les autres onglets
      if (activeTab === 'history') loadPurchases();
      if (activeTab === 'top') loadTopProduct();
      if (activeTab === 'bilan') loadBilan();
    } catch (error) {
      setErrors({
        global:
          "Impossible de joindre le serveur. Vérifiez que le backend est démarré.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toFixed(2)} FCFA`;
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <h1>🛒 Panier Intelligent</h1>
          <p className="app-subtitle">
            Gérez vos achats et analysez vos dépenses facilement
          </p>
        </header>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            ➕ Ajouter un achat
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Historique
          </button>
          <button
            className={`nav-tab ${activeTab === 'top' ? 'active' : ''}`}
            onClick={() => setActiveTab('top')}
          >
            🏆 Top Produit
          </button>
          <button
            className={`nav-tab ${activeTab === 'bilan' ? 'active' : ''}`}
            onClick={() => setActiveTab('bilan')}
          >
            💰 Bilan Financier
          </button>
        </nav>

        <main className="app-main">
          {activeTab === 'add' && (
            <section className="card">
              <h2>Ajouter un achat</h2>
              <p className="card-description">
                Saisissez le nom du produit, son prix et la date d&apos;achat.
              </p>

              {errors.global && (
                <div className="alert alert-error">
                  {errors.global}
                </div>
              )}

              {errors.success && (
                <div className="alert alert-success">
                  {errors.success}
                </div>
              )}

              <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="productName">
                    Nom du produit
                    <span className="required">*</span>
                  </label>
                  <input
                    id="productName"
                    name="productName"
                    type="text"
                    placeholder="Ex : Lait, Riz, Pâtes..."
                    value={form.productName}
                    onChange={handleChange}
                    className={errors.productName ? 'input input-error' : 'input'}
                    autoComplete="off"
                  />
                  {errors.productName && (
                    <p className="field-error">
                      {errors.productName}
                    </p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="price">
                      Prix (FCFA)
                      <span className="required">*</span>
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex : 12.50"
                      value={form.price}
                      onChange={handleChange}
                      className={errors.price ? 'input input-error' : 'input'}
                    />
                    {errors.price && (
                      <p className="field-error">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="purchaseDate">
                      Date d&apos;achat
                      <span className="required">*</span>
                    </label>
                    <input
                      id="purchaseDate"
                      name="purchaseDate"
                      type="date"
                      max={today}
                      value={form.purchaseDate}
                      onChange={handleChange}
                      className={errors.purchaseDate ? 'input input-error' : 'input'}
                    />
                    {errors.purchaseDate && (
                      <p className="field-error">
                        {errors.purchaseDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Ajout en cours...' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'history' && (
            <section className="card">
              <h2>Historique des achats</h2>
              <p className="card-description">
                Liste de vos achats triés du plus récent au plus ancien.
              </p>

              <div className="period-selector">
                <div className="form-field">
                  <label htmlFor="periodStart">Date de début (optionnel)</label>
                  <input
                    id="periodStart"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="periodEnd">Date de fin (optionnel)</label>
                  <input
                    id="periodEnd"
                    type="date"
                    max={today}
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {loadingPurchases ? (
                <div className="loading">Chargement...</div>
              ) : purchases.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>Aucun achat à afficher</p>
                </div>
              ) : (
                <div className="history-list">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="history-item">
                      <div className="history-item-info">
                        <div className="history-item-name">
                          {purchase.product.name}
                        </div>
                        <div className="history-item-date">
                          {formatDate(purchase.purchaseDate)}
                        </div>
                      </div>
                      <div className="history-item-price">
                        {formatPrice(purchase.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'top' && (
            <section className="card">
              <h2>Top Produit</h2>
              <p className="card-description">
                Le produit le plus acheté sur la période sélectionnée (en nombre d&apos;occurrences).
              </p>

              <div className="period-selector">
                <div className="form-field">
                  <label htmlFor="topPeriodStart">Date de début (optionnel)</label>
                  <input
                    id="topPeriodStart"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="topPeriodEnd">Date de fin (optionnel)</label>
                  <input
                    id="topPeriodEnd"
                    type="date"
                    max={today}
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {loadingTop ? (
                <div className="loading">Chargement...</div>
              ) : topProduct === null ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <p>Aucun produit trouvé pour cette période</p>
                </div>
              ) : (
                <div className="top-product-card">
                  <div className="top-product-name">{topProduct.productName}</div>
                  <div className="top-product-count">
                    Acheté {topProduct.count} {topProduct.count > 1 ? 'fois' : 'fois'}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'bilan' && (
            <section className="card">
              <h2>Bilan Financier</h2>
              <p className="card-description">
                Montant total des dépenses sur la période sélectionnée.
              </p>

              <div className="period-selector">
                <div className="form-field">
                  <label htmlFor="bilanPeriodStart">Date de début (optionnel)</label>
                  <input
                    id="bilanPeriodStart"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="bilanPeriodEnd">Date de fin (optionnel)</label>
                  <input
                    id="bilanPeriodEnd"
                    type="date"
                    max={today}
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {loadingBilan ? (
                <div className="loading">Chargement...</div>
              ) : (
                <div className="bilan-card">
                  <div className="bilan-label">Total des dépenses</div>
                  <div className="bilan-amount">
                    {totalAmount.toFixed(2)} FCFA
                  </div>
                  {purchaseCount > 0 && (
                    <div style={{ marginTop: '1rem', color: '#6c757d' }}>
                      {purchaseCount} {purchaseCount > 1 ? 'achats' : 'achat'} sur la période
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </main>

        <footer className="app-footer">
          <span>Panier Intelligent - US-01, US-02, US-03, US-04</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
