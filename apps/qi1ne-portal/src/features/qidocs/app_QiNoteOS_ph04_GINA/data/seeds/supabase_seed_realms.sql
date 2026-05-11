-- QiOS Realm seed v1.1
insert into public.realm
  (realm, realm_slug, title, qi_decimal, enabled, routing_priority, default_sensitivity)
values
  ('QiVault','qivault','QiVault Realm','6.01.00-RLM',true,90,'internal'),
  ('QiPersonal','qipersonal','QiPersonal Realm','6.02.00-RLM',true,80,'confidential'),
  ('QiBusiness','qibusiness','QiBusiness Realm','6.03.00-RLM',true,85,'internal'),
  ('QiClients','qiclients','QiClients Realm','6.04.00-RLM',true,95,'client_confidential'),
  ('QiPlayground','qiplayground','QiPlayground Realm','6.05.00-RLM',true,60,'internal'),
  ('QiResearch','qiresearch','QiResearch Realm','6.06.00-RLM',true,70,'internal'),
  ('QiTemp','qitemp','QiTemp Realm','6.07.00-RLM',true,40,'internal'),
  ('Archives','archives','Archives Realm','6.99.00-RLM',true,10,'restricted'),
  ('QiPublish','qipublish','QiPublish Realm','6.08.00-RLM',false,50,'public'),
  ('QiLegal','qilegal','QiLegal Realm','6.09.00-RLM',false,75,'restricted')
on conflict (realm, realm_slug) do update set
  title = excluded.title,
  qi_decimal = excluded.qi_decimal,
  enabled = excluded.enabled,
  routing_priority = excluded.routing_priority,
  default_sensitivity = excluded.default_sensitivity,
  updated_at = now();
