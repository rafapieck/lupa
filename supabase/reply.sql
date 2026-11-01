-- Lupa: reply templates ("Si quieres contestarle, copia esto:").
-- Adds the nullable reply_es column to fraud_patterns and fills it.
-- Each reply is a fixed, hand-written template: polite, accuses no one, and
-- lets a real employer prove itself without the user sending documents or
-- money. The AI never writes or changes these.
-- Keep in sync with lib/patterns.ts (checked by lib/patterns.test.ts).
-- Safe to re-run.

alter table public.fraud_patterns add column if not exists reply_es text;

update public.fraud_patterns as f
   set reply_es = v.reply_es
  from (values
    ('upfront_payment',
     'Me interesa. ¿Me puede dar el nombre de la empresa y su RFC? Prefiero pagar cualquier cosa ya contratado y con recibo.'),
    ('personal_documents',
     'Con gusto. ¿Me pasa el nombre y la dirección de la empresa? Mi INE la llevo en persona el día que me presente.'),
    ('impersonated_brand',
     'Me interesa. ¿Me pasa el enlace de la vacante en la página oficial de la empresa para postularme por ahí?'),
    ('travel_housing_bait',
     'Me interesa. ¿Me pasa el nombre de la empresa, la dirección del lugar de trabajo y un teléfono fijo de la oficina para confirmar?'),
    ('easy_task_money',
     'Me interesa. Antes de empezar, ¿me pasa el nombre de la empresa, su RFC y el contrato por escrito? No hago depósitos para recibir pagos.'),
    ('chat_only_contact',
     '¿Podemos hacer la entrevista en persona o por videollamada? ¿Cuál es la dirección de la empresa?'),
    ('unrealistic_pay',
     'Me interesa. ¿Me puede mandar por escrito el nombre de la empresa, el puesto, las funciones y el sueldo?'),
    ('immediate_hiring',
     'Me interesa. ¿Me pasa el nombre de la empresa y la dirección para ir a una entrevista en persona?'),
    ('generic_email',
     'Me interesa. ¿Me pasa el nombre completo de la empresa, su RFC y un teléfono de la oficina?'),
    ('vague_job_description',
     'Me interesa. ¿Me puede decir por escrito el puesto, las funciones, el sueldo, el horario y la dirección?'),
    ('no_company_name',
     'Me interesa. ¿Cuál es el nombre de la empresa y su dirección?')
  ) as v(id, reply_es)
 where f.id = v.id;
