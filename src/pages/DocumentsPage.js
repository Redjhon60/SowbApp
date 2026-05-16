// ═══════════════════════════════════════════════════════════════
// DocumentsPage.js
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, Eye, FileText, Image, File } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.getDocuments().then(d => { setDocuments(d); setLoading(false); });
  }, []);

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return <FileText size={20} style={{ color: 'var(--danger)' }} />;
    if (mimeType?.includes('image')) return <Image size={20} style={{ color: 'var(--info)' }} />;
    return <File size={20} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Documents</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Gestion des documents scolaires
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <FolderOpen size={56} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.2, color: 'var(--accent-orange)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucun document enregistré</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Les documents sont automatiquement archivés lors des paiements et autres opérations.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td>{getFileIcon(doc.mimeType)}</td>
                    <td style={{ fontWeight: '500', fontSize: '0.875rem' }}>{doc.title}</td>
                    <td><span className="badge badge-gray">{doc.type}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{doc.description || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doc.createdAt?.slice(0, 10)}</td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => window.api.openDocument(doc.filePath)}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
