alter type certificate_type add value if not exists 'speaking';
alter type certificate_type add value if not exists 'contribution';
alter type certificate_type add value if not exists 'organizing';

-- Optional pilot data updates:
-- update certificates set certificate_type = 'speaking' where public_slug = '...';
-- update certificates set certificate_type = 'contribution' where public_slug = '...';
-- update certificates set certificate_type = 'organizing' where public_slug = '...';
