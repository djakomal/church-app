import fr from '../../translations/fr';
import en from '../../translations/en';

describe('Translations', () => {
  it('should have all keys in French', () => {
    expect(Object.keys(fr).length).toBeGreaterThan(100);
    expect(fr['app.name']).toBe('Gestion de Culte');
    expect(fr['auth.login']).toBe('Se connecter');
    expect(fr['um.title']).toBe('Gestion des Utilisateurs');
    expect(fr['um.role.leader']).toBe('Responsable');
    expect(fr['um.role.guest']).toBe('Invité');
  });

  it('should have all keys in English', () => {
    expect(Object.keys(en).length).toBeGreaterThan(100);
    expect(en['app.name']).toBe('Worship Management');
    expect(en['auth.login']).toBe('Sign In');
    expect(en['um.title']).toBe('User Management');
    expect(en['um.role.leader']).toBe('Leader');
    expect(en['um.role.guest']).toBe('Guest');
  });

  it('should have matching keys between French and English', () => {
    const frKeys = Object.keys(fr).sort();
    const enKeys = Object.keys(en).sort();

    const missingInEn = frKeys.filter(k => !enKeys.includes(k));
    const missingInFr = enKeys.filter(k => !frKeys.includes(k));

    if (missingInEn.length > 0) {
      console.log('Missing in English:', missingInEn);
    }
    if (missingInFr.length > 0) {
      console.log('Missing in French:', missingInFr);
    }

    expect(missingInEn.length).toBe(0);
    expect(missingInFr.length).toBe(0);
  });

  it('should support parameter interpolation', () => {
    const result = fr['home.welcome'].replace('{name}', 'Jean');
    expect(result).toBe('Bienvenue, Jean');
  });
});
