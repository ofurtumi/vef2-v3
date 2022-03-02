# vef2-v3
æfing í byggingu vefþjónusta

## Virkni
> logga inn sem admin
> curl -c 'cookies' -X POST -d 'username=admin&password=123' localhost:6969/admin/login

> skrá notanda (ekki admin)
> curl -c 'cookies' -X POST -d 'username=testuser&name=Tóti Tannálfur&password=123' localhost:6969/users/register

> logga inn sem basic bitch
> curl -c 'cookies' -X POST -d 'username=bob&password=123' localhost:6969/admin/login

> skoða sjálfan sig
> curl -b 'cookies' localhost:6969/users/me

> eyða event
> curl -b 'cookies' -X POST localhost:6969/admin/delete-event/2


>Linkur á síðuna er [v2-vef2.herokuapp.com](https://v3-vef2.herokuapp.com/)