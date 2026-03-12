# Terraform for english.giamgia.de (S3 static hosting + Cloudflare DNS)

This Terraform stack now does 3 jobs:

1. Creates an S3 bucket configured for static website hosting.
2. Uploads the built frontend files from `../web/out` to S3.
3. Creates/updates the Cloudflare DNS record for `english.giamgia.de`.

## Prerequisites

- Terraform >= 1.6
- AWS credentials configured in shell (`AWS_PROFILE` or env vars)
- Cloudflare API token with `Zone:DNS:Edit` for zone `giamgia.de`
- Frontend built first so `../web/out` exists

## Variables

Set Cloudflare token via environment variable:

```bash
export TF_VAR_cloudflare_api_token="<CLOUDFLARE_TOKEN>"
```

Example `terraform.tfvars`:

```hcl
zone_name         = "giamgia.de"
subdomain         = "english"
aws_region        = "eu-central-1"
aws_bucket_name   = "english-kids-static-prod"
build_output_path = "../web/out"
upload_assets     = true
proxied           = true
ttl               = 1
```

## Deployment flow

1. Build frontend static output:

```bash
cd ../web
npm install
npm run build
```

2. Apply infrastructure + upload artifacts:

```bash
cd ../0.englisch.giamgia.de
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

3. Verify:

```bash
dig english.giamgia.de +short
curl -I http://english.giamgia.de
```

## Notes

- This implementation points Cloudflare CNAME to the S3 website endpoint.
- S3 website hosting requires public-read object access. If you need a private origin and stronger security posture, migrate to CloudFront + OAC in the next phase.
