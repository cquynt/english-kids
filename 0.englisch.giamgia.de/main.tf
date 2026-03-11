terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "cloudflare_zone" "this" {
  name = var.zone_name
}

resource "cloudflare_record" "app" {
  zone_id = data.cloudflare_zone.this.id
  name    = var.record_name
  type    = "CNAME"
  value   = var.elb_hostname
  ttl     = var.ttl
  proxied = var.proxied
}
