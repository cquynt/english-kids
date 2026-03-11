output "record_fqdn" {
  description = "FQDN of the created/updated record."
  value       = cloudflare_record.app.hostname
}

output "record_id" {
  description = "Cloudflare record ID."
  value       = cloudflare_record.app.id
}
