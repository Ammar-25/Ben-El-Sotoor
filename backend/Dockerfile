FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["BaynAlSutoor.API/BaynAlSutoor.API.csproj", "BaynAlSutoor.API/"]
COPY ["BaynAlSutoor.Application/BaynAlSutoor.Application.csproj", "BaynAlSutoor.Application/"]
COPY ["BaynAlSutoor.Domain/BaynAlSutoor.Domain.csproj", "BaynAlSutoor.Domain/"]
COPY ["BaynAlSutoor.Infrastructure/BaynAlSutoor.Infrastructure.csproj", "BaynAlSutoor.Infrastructure/"]
COPY ["BaynAlSutoor.Persistence/BaynAlSutoor.Persistence.csproj", "BaynAlSutoor.Persistence/"]
RUN dotnet restore "BaynAlSutoor.API/BaynAlSutoor.API.csproj"
COPY . .
WORKDIR "/src/BaynAlSutoor.API"
RUN dotnet build "BaynAlSutoor.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BaynAlSutoor.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BaynAlSutoor.API.dll"]
