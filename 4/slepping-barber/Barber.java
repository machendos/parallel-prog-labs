
public class Barber extends Thread {

  Barbershop barbershop;

  public Barber(Barbershop barbershop) {
    this.barbershop = barbershop;
  }

  public void run() {

    while (true) {

      while (barbershop.currClients.get() == 0) {
        synchronized (barbershop.barberMutex) {
          try {
            barbershop.barberMutex.wait();
          } catch (InterruptedException e) {
          }
        }
      }
      synchronized (barbershop.currClients) {
        barbershop.currClients.decrementAndGet();

        Client client = barbershop.waitingRoom.poll();
        synchronized (client) {
          client.notify();
        }
        try {
          Thread.sleep(barbershop.haircutTime);
        } catch (InterruptedException e) {
        }
        synchronized (client) {
          client.notify();
        }
      }
    }
  }

}
