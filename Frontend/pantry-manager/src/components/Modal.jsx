export default function Modal({ title, children, onClose }) {
    return (
        <div className="modal-backdrop">
            <section className="modal-card">
                <div className="modal-head">
                    <h2>{title}</h2>
                    <button className="icon-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                {children}
            </section>
        </div>
    );
}