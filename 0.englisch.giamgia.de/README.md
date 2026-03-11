# Cloudflare DNS for englisch.giamgia.de -> EKS ELB

## Prerequisites
- Terraform >= 1.6
- Cloudflare API Token with `Zone:DNS:Edit` on your zone `giamgia.de`
- ELB hostname from your EKS ingress/service (e.g. `a601d585a58b64e71b36e631c97759dc-1702538151.eu-central-1.elb.amazonaws.com`)

## Usage
1) Copy example vars:
```bash
cat > terraform.tfvars <<'EOF'
cloudflare_api_token = "CF_API_TOKEN"
zone_name            = "giamgia.de"
record_name          = "app"            # results in englisch.giamgia.de
elb_hostname         = "<ELB_HOSTNAME>" # replace with current ELB DNS name
proxied              = false            # keep false for LB; true if you want CF proxy
ttl                  = 300
EOF
```
2) Init + apply:
```bash
terraform init
terraform plan
terraform apply
```
3) Verify:
```bash
nslookup englisch.giamgia.de
```

## Notes
- The record is a CNAME pointing to the ELB hostname. When ELB changes, update `elb_hostname` and re-`apply`.
- Keep `proxied=false` if using AWS-managed certs/ALB/ingress; you can set `true` to terminate TLS at Cloudflare if desired.
