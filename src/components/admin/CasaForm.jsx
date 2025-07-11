import React, { useState, useEffect } from "react";
import styles from "../../pages/AdminPage.module.css";

const HomeIcon = () => <span className={styles.icon}>&#127968;</span>;
const NumberIcon = () => <span className={styles.icon}>#</span>;
const CepIcon = () => <span className={styles.icon}>&#128230;</span>;
const CityIcon = () => <span className={styles.icon}>&#127961;</span>;
const StateIcon = () => <span className={styles.icon}>&#127463;&#127479;</span>;
const RulesIcon = () => <span className={styles.icon}>&#128220;</span>;
const OwnerIcon = () => <span className={styles.icon}>&#128100;</span>;

function CasaForm({ casaAtual, onSave, onCancel, isLoading, locadores }) {
  const [formData, setFormData] = useState({
    endereco: "",
    numero: "",
    cep: "",
    cidade: "",
    estado: "",
    diretrizes: "",
    complemento: "",
    locadorId: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (casaAtual) {
      setFormData({
        endereco: casaAtual.endereco || "",
        numero: casaAtual.numero?.toString() || "",
        cep: casaAtual.cep || "",
        cidade: casaAtual.cidade || "",
        estado: casaAtual.estado || "",
        diretrizes: casaAtual.diretrizes || "",
        complemento: casaAtual.complemento || "",
        locadorId: casaAtual.locadorId?.toString() || "",
      });
    } else {
      setFormData({
        endereco: "",
        numero: "",
        cep: "",
        cidade: "",
        estado: "",
        diretrizes: "",
        complemento: "",
        locadorId: "",
      });
    }
  }, [casaAtual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    console.log("CasaForm: Submit. Dados do formulário:", formData);

    if (
      !formData.endereco ||
      !formData.numero ||
      !formData.diretrizes ||
      !formData.locadorId
    ) {
      setFormError(
        "Endereço, Número, Diretrizes e ID do Locador são obrigatórios."
      );
      return;
    }

    const payload = {
      ...formData,
      numero: parseInt(formData.numero, 10),
      locadorId: parseInt(formData.locadorId, 10),
    };

    if (!payload.complemento) {
      delete payload.complemento;
    }
    if (!payload.cep) delete payload.cep;
    if (!payload.cidade) delete payload.cidade;
    if (!payload.estado) delete payload.estado;

    if (isNaN(payload.numero) || isNaN(payload.locadorId)) {
      setFormError(
        "Número e ID do Locador devem ser valores numéricos válidos."
      );
      return;
    }

    console.log("CasaForm: Payload a ser enviado para onSave:", payload);
    onSave(payload, casaAtual?.id);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainerModal} style={{ maxWidth: "700px" }}>
        {" "}
        {}
        <h3>{casaAtual ? "Editar Casa" : "Adicionar Nova Casa"}</h3>
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div
              className={styles.inputGroupAdmin}
              style={{ gridColumn: "span 2" }}
            >
              <HomeIcon />
              <input
                className={styles.formInput}
                type="text"
                name="endereco"
                placeholder="Endereço (Rua, Av.)"
                value={formData.endereco}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroupAdmin}>
              <NumberIcon />
              <input
                className={styles.formInput}
                type="number"
                name="numero"
                placeholder="Número"
                value={formData.numero}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroupAdmin}>
              <CepIcon />
              <input
                className={styles.formInput}
                type="text"
                name="cep"
                placeholder="CEP"
                value={formData.cep}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroupAdmin}>
              <CityIcon />
              <input
                className={styles.formInput}
                type="text"
                name="cidade"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroupAdmin}>
              <StateIcon />
              <input
                className={styles.formInput}
                type="text"
                name="estado"
                placeholder="Estado (UF)"
                value={formData.estado}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div
              className={styles.inputGroupAdmin}
              style={{ gridColumn: "span 2" }}
            >
              <input
                className={styles.formInput}
                type="text"
                name="complemento"
                placeholder="Complemento (Bloco, Apto, etc.) - Opcional"
                value={formData.complemento}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div
              className={styles.inputGroupAdmin}
              style={{ gridColumn: "span 2" }}
            >
              <RulesIcon />
              <textarea
                className={styles.formTextarea}
                name="diretrizes"
                placeholder="Diretrizes da casa (regras, informações importantes)"
                value={formData.diretrizes}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div
              className={styles.inputGroupAdmin}
              style={{ gridColumn: "span 2" }}
            >
              <OwnerIcon />
              {}
              {}
              <select
                name="locadorId"
                value={formData.locadorId}
                onChange={handleChange}
                required
                disabled={isLoading || !locadores || locadores.length === 0}
                className={styles.formInput}
              >
                <option value="">Selecione um Locador</option>
                {locadores &&
                  locadores.map((locador) => (
                    <option key={locador.id} value={locador.id}>
                      {locador.name} (ID: {locador.id})
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.actionButton}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CasaForm;
