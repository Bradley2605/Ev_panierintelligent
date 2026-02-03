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

type Tab = 'add' | 'history';

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
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>(today);

  // Charger les achats quand on est sur l'onglet Historique
  useEffect(() => {
    if (activeTab === 'history') {
      loadPurchases();
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
      const response = await fetch('http://localhost:3000/achats', {
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

      // Recharger l'historique si on est sur cet onglet
      if (activeTab === 'history') {
        loadPurchases();
      }
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
            Enregistrez vos achats rapidement avec un suivi clair
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
                    placeholder="Ex : 1250.00"
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
        </main>

        <footer className="app-footer">
          <span>US-01, US-02 · Ajout et Historique</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
