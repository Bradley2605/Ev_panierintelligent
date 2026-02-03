import { FormEvent, useMemo, useState } from 'react';
import './App.css';

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

function App() {
  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const [form, setForm] = useState<PurchaseFormState>({
    productName: '',
    price: '',
    purchaseDate: today,
  });
  const [errors, setErrors] = useState<FormErrorState>({});
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      setErrors({
        global:
          "Impossible de joindre le serveur. Vérifiez que le backend est démarré.",
      });
    } finally {
      setLoading(false);
    }
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

        <main className="app-main">
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
        </main>

        <footer className="app-footer">
          <span>US-01 · Ajout d&apos;un achat</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
