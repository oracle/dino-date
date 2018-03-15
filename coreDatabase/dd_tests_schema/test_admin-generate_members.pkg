create or replace package test_admin_generate_members as
  -- %suite(DinoDate)
  -- %suitepath(dd.dd_admin_pkg.generate_members)
  -- %rollback(manual)

  -- %beforeall
  procedure before_all;
  
  -- %afterall
  procedure after_all;

  --%aftereach
  procedure delete_added_members;
    
  -- %test(Should generate 10 members)
  procedure generate_ten;

  -- %test(Should generate 19 members)
  procedure generate_over_limit;

  -- %test(Should generate 0 members)
  procedure generate_zero;

end test_admin_generate_members;
/