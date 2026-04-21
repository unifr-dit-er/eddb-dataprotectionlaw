# Déploiement avec Podman + Quadlet

## Prérequis

- Podman installé sur la VM
- Accès au répertoire `/home/podman/.config/containers/systemd/`

## 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd eddb-dataprotectionlaw
```

## 2. Configurer le token NocoDB

Dans le fichier `eddb-dataprotectionlaw.container`, remplacer la valeur de `NOCODB_API_TOKEN` :

```ini
Environment=NOCODB_API_TOKEN=your_token_here
```

## 3. Déployer le fichier Quadlet

```bash
cp eddb-dataprotectionlaw.container /home/podman/.config/containers/systemd/
```

## 4. Builder l'image

```bash
podman build -t eddb-dataprotectionlaw:latest .
```

## 5. Démarrer le service

```bash
systemctl --user daemon-reload
systemctl --user start eddb-dataprotectionlaw.service
```

## Commandes utiles

```bash
# Voir les logs
podman logs -f eddb-dataprotectionlaw

# Statut du service
systemctl --user status eddb-dataprotectionlaw.service

# Redémarrer après un rebuild
podman build -t eddb-dataprotectionlaw:latest .
systemctl --user restart eddb-dataprotectionlaw.service
```
