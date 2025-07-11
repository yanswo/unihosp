import React, { useState, useEffect } from "react";
import styles from "./CasaLocadorForm.module.css";

const HomeIcon = () => <span className={styles.icon}>&#127968;</span>;
const NumberIcon = () => <span className={styles.icon}>#</span>;
const CepIcon = () => <span className={styles.icon}>&#128230;</span>;
const CityIcon = () => <span className={styles.icon}>&#127961;</span>;
const StateIcon = () => <span className={styles.icon}>&#127463;&#127479;</span>;
const RulesIcon = () => <span className={styles.icon}>&#128220;</span>;
const PriceIcon = () => <span className={styles.icon}>&#128176;</span>;
const ImageIcon = () => <span className={styles.icon}>&#128444;</span>;

function CasaLocadorForm({
  casaAtual,
  onSave,
  onCancel,
  isLoading,
  locadorId,
}) {
  const [formData, setFormData] = useState({
    endereco: "",
    numero: "",
    cep: "",
    cidade: "",
    estado: "",
    diretrizes: "",
    complemento: "",
    precoPorNoite: "",
    imagemUrl1: "",
    imagemUrl2: "",
    imagemUrl3: "",
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
        precoPorNoite: casaAtual.precoPorNoite?.toString() || "",
        diretrizes: casaAtual.diretrizes || "",
        complemento: casaAtual.complemento || "",
        imagemUrl1: casaAtual.imagens?.[0]?.url || "",
        imagemUrl2: casaAtual.imagens?.[1]?.url || "",
        imagemUrl3: casaAtual.imagens?.[2]?.url || "",
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
        precoPorNoite: "",
        imagemUrl1: "",
        imagemUrl2: "",
        imagemUrl3: "",
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

    if (
      !formData.endereco ||
      !formData.numero ||
      !formData.diretrizes ||
      !locadorId ||
      !formData.precoPorNoite
    ) {
      setFormError(
        "Endereço, Número, Diretrizes, Preço por Noite e ID do Locador (automático) são obrigatórios."
      );
      return;
    }

    const numeroConvertido = parseInt(formData.numero, 10);
    const precoNumerico = parseFloat(formData.precoPorNoite);

    if (isNaN(numeroConvertido) || numeroConvertido <= 0) {
      setFormError("Número da casa deve ser um valor numérico positivo.");
      return;
    }
    if (isNaN(precoNumerico) || precoNumerico < 0) {
      setFormError(
        "Preço por Noite deve ser um valor numérico válido e não negativo."
      );
      return;
    }

    const imagensUrls = [
      formData.imagemUrl1.trim(),
      formData.imagemUrl2.trim(),
      formData.imagemUrl3.trim(),
    ].filter(url => url !== "" && (url.startsWith('http://') || url.startsWith('https://')));

    if (imagensUrls.length === 0 && (formData.imagemUrl1 || formData.imagemUrl2 || formData.imagemUrl3)) {
        setFormError("Pelo menos uma URL de imagem fornecida não é válida. URLs devem começar com http:// ou https://.");
        return;
    }


    const payload = {
      endereco: formData.endereco,
      numero: numeroConvertido,
      cep: formData.cep.trim() || null,
      cidade: formData.cidade.trim() || null,
      estado: formData.estado.trim() || null,
      diretrizes: formData.diretrizes,
      complemento: formData.complemento.trim() || null,
      precoPorNoite: precoNumerico,
      locadorId: parseInt(locadorId),
      imagensUrls: imagensUrls,
    };
    

    onSave(payload, casaAtual?.id);
  };

  return (
    <div className={styles.formOverlay}>
      <div
        className={styles.formContainerModal}
        style={{ maxWidth: "700px" }}
      >
        <h3>{casaAtual ? "Editar Minha Casa" : "Adicionar Nova Casa"}</h3>
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div
              className={styles.inputGroup}
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
            <div className={styles.inputGroup}>
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
            <div className={styles.inputGroup}>
              <CepIcon />
              <input
                className={styles.formInput}
                type="text"
                name="cep"
                placeholder="CEP (Opcional)"
                value={formData.cep}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <CityIcon />
              <input
                className={styles.formInput}
                type="text"
                name="cidade"
                placeholder="Cidade (Opcional)"
                value={formData.cidade}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <StateIcon />
              <input
                className={styles.formInput}
                type="text"
                name="estado"
                placeholder="Estado (UF, Opcional)"
                value={formData.estado}
                onChange={handleChange}
                disabled={isLoading}
                maxLength="2"
              />
            </div>
            <div
              className={styles.inputGroup}
              style={{ gridColumn: "span 2" }}
            >
               {}
              <input
                className={styles.formInput}
                type="text"
                name="complemento"
                placeholder="Complemento (Opcional)"
                value={formData.complemento}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div
              className={styles.inputGroup}
              style={{ gridColumn: "span 2" }}
            >
              <RulesIcon />
              <textarea
                className={styles.formTextarea}
                name="diretrizes"
                placeholder="Diretrizes da casa (Ex: Não fumar, sem festas após as 22h)"
                value={formData.diretrizes}
                onChange={handleChange}
                required
                disabled={isLoading}
                rows="3"
              />
            </div>
            <div
              className={styles.inputGroup}
              style={{ gridColumn: "span 2" }}
            >
              <PriceIcon />
              <input
                className={styles.formInput}
                type="number"
                name="precoPorNoite"
                placeholder="Preço por Noite (R$)"
                value={formData.precoPorNoite}
                onChange={handleChange}
                required
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>

            <div className={styles.sectionTitle} style={{ gridColumn: "span 2" }}>
              <h4>Imagens da Casa (Cole as URLs abaixo)</h4>
            </div>

            <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
              <ImageIcon />
              <input
                className={styles.formInput}
                type="url"
                name="imagemUrl1"
                placeholder="URL da Imagem Principal (Ex: https://.../imagem.jpg)"
                value={formData.imagemUrl1}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
              <ImageIcon />
              <input
                className={styles.formInput}
                type="url"
                name="imagemUrl2"
                placeholder="URL da Imagem 2 (Opcional)"
                value={formData.imagemUrl2}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
              <ImageIcon />
              <input
                className={styles.formInput}
                type="url"
                name="imagemUrl3"
                placeholder="URL da Imagem 3 (Opcional)"
                value={formData.imagemUrl3}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            {}
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.actionButton}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : casaAtual ? "Salvar Alterações" : "Adicionar Casa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CasaLocadorForm;