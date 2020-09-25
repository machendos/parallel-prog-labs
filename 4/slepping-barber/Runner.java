
public class Runner {

  public static void main(String[] args) {

    int clientsCount = 10;
    int currClientsArrived = 0;
    int newClientAfter = 50;

    Barbershop barbershop = new Barbershop(4, 100);
    Barber barber = new Barber(barbershop);

    barber.start();

    while (++currClientsArrived < clientsCount) {
      Client client = new Client(barbershop, "client" + currClientsArrived);
      client.start();
      try {
        Thread.sleep(newClientAfter);
      } catch (InterruptedException e) {
      }
    }

  }
}
